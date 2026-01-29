import { Router } from "express";
import { z } from "zod";
import { createAnonymousBet } from "../lib/bets";
import { prisma } from "../lib/prisma";
import { apiFootballGet } from "../lib/apiFootball";

const router = Router();

// --- Schemas ---
const selectionSchema = z.object({
    fixtureId: z.number().int(),
    market: z.string().min(1),
    selection: z.string().min(1),
    marketCode: z.string().min(1),
    selectionCode: z.string().min(1),
    line: z.number().nullable(),
    oddValue: z.number().positive(),
});

const createBetSchema = z.object({
    amount: z.number().positive(),
    selections: z.array(selectionSchema),
});

const ticketSchema = z.object({
    reference: z.string().min(8),
});

const checkSchema = z.object({
    reference: z.string().min(8),
});

import { checkItemResult } from "../lib/resultChecker";

// --- Routes ---

// POST /api/bet/create
router.post("/create", async (req, res) => {
    try {
        const { amount, selections } = createBetSchema.parse(req.body);
        const { bet, items } = await createAnonymousBet({ amount, selections });
        res.status(201).json({ bet, items });
    } catch (error: any) {
        console.error("Create Bet Error:", error);
        if (error.name === "BettingError") {
            res.status(409).json({
                error: error.message,
                changes: error.changes,
                code: error.code
            });
        } else {
            res.status(400).json({ error: error.message || "Failed to create bet" });
        }
    }
});

// GET /api/bet/ticket?reference=...
router.get("/ticket", async (req, res) => {
    try {
        const reference = req.query.reference as string;
        const { reference: ref } = ticketSchema.parse({ reference });

        const bet = await prisma.bet.findUnique({
            where: { reference: ref },
            include: { items: true },
        });

        if (!bet) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        // Fetch fixtures and fresh odds for details
        const fixtureIds = [...new Set(bet.items.map((item) => item.fixtureId))];
        console.log(`[GET /ticket] Fetching fixtures for IDs:`, fixtureIds);
        const fixtures: any[] = [];
        const fixturesMap: Record<number, any> = {};

        // 1. Fetch Unique Fixtures in Parallel
        await Promise.all(fixtureIds.map(async (fid) => {
            const params = new URLSearchParams();
            params.set("id", fid.toString());

            try {
                // Try cache first for reliability (avoid API timeouts)
                const fRes = await apiFootballGet("/fixtures", params, 60000, false);
                if (fRes.response && fRes.response.length > 0) {
                    const data = fRes.response[0];
                    fixtures.push(data);
                    fixturesMap[fid] = data;
                }
            } catch (e) {
                console.error(`Failed to fetch fixture ${fid} from cache, trying force refresh...`, e);
                // Fallback to force refresh if cache fails
                try {
                    const fResForce = await apiFootballGet("/fixtures", params, 60000, true);
                    if (fResForce.response && fResForce.response.length > 0) {
                        const data = fResForce.response[0];
                        fixtures.push(data);
                        fixturesMap[fid] = data;
                    }
                } catch (e2) {
                    console.error(`Failed to fetch fixture ${fid} even with force refresh`, e2);
                }
            }
        }));

        console.log(`[GET /ticket] Fixtures fetched:`, Object.keys(fixturesMap).length, "out of", fixtureIds.length);
        console.log(`[GET /ticket] FixturesMap keys:`, Object.keys(fixturesMap));

        // Import fixture metadata cache for fallback
        const { getFixtureMetadata, storeFixtureMetadata } = await import("../lib/fixtureMetadataCache");

        // Store successfully fetched fixtures in permanent cache
        for (const fixture of Object.values(fixturesMap)) {
            storeFixtureMetadata(fixture);
        }

        // 2. Map items to their fresh data
        const enrichedItems = [];

        for (const item of bet.items) {
            let currentOdd = item.oddValue; // Default to booked odd
            let isStarted = false;
            const fixtureData = fixturesMap[item.fixtureId];

            // FALLBACK: If API doesn't have fixture, try permanent cache
            let fixtureDetails = null;
            if (fixtureData) {
                const status = fixtureData.fixture.status.short;
                // NS = Not Started. Anything else (LIVE, ft, etc.) is considered 'started' for betting purposes mostly
                if (status !== 'NS' && status !== 'TBD') {
                    isStarted = true;
                }

                fixtureDetails = {
                    home: fixtureData.teams.home.name,
                    away: fixtureData.teams.away.name,
                    date: fixtureData.fixture.date,
                    status: fixtureData.fixture.status,
                    score: fixtureData.score.fulltime
                };
            } else {
                // Try to get from permanent cache
                const cachedMetadata = getFixtureMetadata(item.fixtureId);
                if (cachedMetadata) {
                    console.log(`[GET /ticket] Using cached metadata for fixture ${item.fixtureId}: ${cachedMetadata.home} vs ${cachedMetadata.away}`);
                    fixtureDetails = {
                        home: cachedMetadata.home,
                        away: cachedMetadata.away,
                        date: cachedMetadata.date,
                        status: { short: 'FT', long: 'Finished' }, // Assume finished if not in API
                        score: { home: null, away: null }
                    };
                    isStarted = true; // Old games are definitely started
                }
            }

            // Fetch Fresh Odds (Only if not started and fixtureData exists)
            if (fixtureData && !isStarted) {
                try {
                    const oddsParams = new URLSearchParams();
                    oddsParams.set("fixture", item.fixtureId.toString());
                    const oRes = await apiFootballGet("/odds", oddsParams);

                    if (oRes.response && oRes.response.length > 0) {
                        const markets = oRes.response[0].bookmakers?.[0]?.bets || [];
                        const market = markets.find((m: any) => m.name === item.market || m.id.toString() === item.marketCode);
                        if (market) {
                            const selection = market.values.find((v: any) => v.value === item.selection || v.value === item.selectionCode);
                            if (selection) {
                                currentOdd = parseFloat(selection.odd);
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch odds for item", item.id);
                }
            }

            console.log(`[GET /ticket] Item ${item.id} fixtureId=${item.fixtureId} fixtureDetails=`, fixtureDetails ? `${fixtureDetails.home} vs ${fixtureDetails.away}` : "NULL");

            enrichedItems.push({
                ...item,
                currentOdd,
                isStarted,
                // Attach fixture details for frontend display logic (names vs IDs)
                fixtureDetails
            });
        }

        res.json({
            bet: {
                id: bet.id,
                reference: bet.reference,
                amount: bet.amount,
                totalOdds: bet.totalOdds,
                status: bet.status,
                createdAt: bet.createdAt,
            },
            items: enrichedItems,
            fixtures,
        });
    } catch (error) {
        console.error("Get Ticket Error:", error);
        res.status(500).json({ error: "Failed to get ticket" });
    }
});

// POST /api/bet/check
// Publicly trigger a result check for a bet
router.post("/check", async (req, res) => {
    try {
        const { reference } = checkSchema.parse(req.body);

        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        // Logic similar to cashier check-slip
        let allItemsResolved = true;
        let anyItemLost = false;
        const updatedItems: any[] = [];
        const fixturesMap: Record<number, any> = {};

        // 1. Fetch Fixtures
        const fixtureIds = [...new Set(bet.items.map(i => i.fixtureId))];
        await Promise.all(fixtureIds.map(async (fid) => {
            const params = new URLSearchParams();
            params.set("id", fid.toString());

            try {
                // Force refresh to bypass cache for checking results
                const fRes = await apiFootballGet("/fixtures", params, 60000, true);
                if (fRes.response && fRes.response.length > 0) {
                    fixturesMap[fid] = fRes.response[0];
                }
            } catch (e) {
                console.warn(`Force refresh failed for fixture ${fid} in public check, trying cache...`, e);
                // Fallback
                try {
                    const fResCache = await apiFootballGet("/fixtures", params, 60000, false);
                    if (fResCache.response && fResCache.response.length > 0) {
                        fixturesMap[fid] = fResCache.response[0];
                    }
                } catch (e2) {
                    console.error(`Failed to fetch fixture ${fid}`, e2);
                }
            }
        }));

        // 2. Check Items
        for (const item of bet.items) {
            const fixture = fixturesMap[item.fixtureId];
            let itemResult = item.result;

            if (fixture) {
                const checkRes = checkItemResult(
                    item.marketCode || "UNKNOWN",
                    item.selectionCode || "",
                    item.line,
                    fixture,
                    item.oddValue,
                    item.market, // Fallback: Raw Market Name
                    item.selection // Fallback: Raw Selection Name
                );

                if (checkRes === "WON") itemResult = "WON";
                else if (checkRes === "LOST") { itemResult = "LOST"; anyItemLost = true; }
                else if (checkRes === "VOID") itemResult = "VOID";
                else allItemsResolved = false;

                // Update DB if changed
                if (itemResult !== item.result) {
                    await prisma.betItem.update({
                        where: { id: item.id },
                        data: { result: itemResult }
                    });
                }
            } else {
                allItemsResolved = false;
            }

            // Return enriched item for Frontend Display
            updatedItems.push({
                ...item,
                result: itemResult,
                // Attach fixture details for the detailed table (score, time)
                fixtureDetails: fixture ? {
                    home: fixture.teams.home.name,
                    away: fixture.teams.away.name,
                    date: fixture.fixture.date,
                    status: fixture.fixture.status,
                    score: fixture.score.fulltime // 90 min score
                } : null
            });
        }

        // 3. Update Bet Status
        let newBetStatus = bet.status;
        if (["CONFIRMED", "PENDING_PAYMENT", "WON", "LOST"].includes(bet.status)) {
            if (anyItemLost) {
                newBetStatus = "LOST";
            } else if (allItemsResolved) {
                newBetStatus = "WON";
            }
        }

        if (newBetStatus !== bet.status) {
            const updatedBet = await prisma.bet.update({
                where: { id: bet.id },
                data: { status: newBetStatus }
            });
            return res.json({ bet: updatedBet, items: updatedItems });
        }

        res.json({ bet, items: updatedItems });

    } catch (error: any) {
        console.error("Check Bet Error:", error);
        res.status(500).json({ error: "Failed to check bet" });
    }
});

// POST /api/bet/check-results
// Alias for /check endpoint (for frontend compatibility)
router.post("/check-results", async (req, res) => {
    try {
        const { reference } = checkSchema.parse(req.body);

        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        // Logic similar to cashier check-slip
        let allItemsResolved = true;
        let anyItemLost = false;
        const updatedItems: any[] = [];
        const fixturesMap: Record<number, any> = {};

        // 1. Fetch Fixtures
        const fixtureIds = [...new Set(bet.items.map(i => i.fixtureId))];
        await Promise.all(fixtureIds.map(async (fid) => {
            const params = new URLSearchParams();
            params.set("id", fid.toString());

            try {
                // Force refresh to bypass cache for checking results
                const fRes = await apiFootballGet("/fixtures", params, 60000, true);
                if (fRes.response && fRes.response.length > 0) {
                    fixturesMap[fid] = fRes.response[0];
                }
            } catch (e) {
                console.warn(`Force refresh failed for fixture ${fid} in check-results, trying cache...`, e);
                // Fallback
                try {
                    const fResCache = await apiFootballGet("/fixtures", params, 60000, false);
                    if (fResCache.response && fResCache.response.length > 0) {
                        fixturesMap[fid] = fResCache.response[0];
                    }
                } catch (e2) {
                    console.error(`Failed to fetch fixture ${fid}`, e2);
                }
            }
        }));

        // 2. Check Items
        for (const item of bet.items) {
            const fixture = fixturesMap[item.fixtureId];
            let itemResult = item.result;

            if (fixture) {
                const checkRes = checkItemResult(
                    item.marketCode || "UNKNOWN",
                    item.selectionCode || "",
                    item.line,
                    fixture,
                    item.oddValue,
                    item.market, // Fallback: Raw Market Name
                    item.selection // Fallback: Raw Selection Name
                );

                if (checkRes === "WON") itemResult = "WON";
                else if (checkRes === "LOST") { itemResult = "LOST"; anyItemLost = true; }
                else if (checkRes === "VOID") itemResult = "VOID";
                else allItemsResolved = false;

                // Update DB if changed
                if (itemResult !== item.result) {
                    await prisma.betItem.update({
                        where: { id: item.id },
                        data: { result: itemResult }
                    });
                }
            } else {
                allItemsResolved = false;
            }

            // Return enriched item for Frontend Display
            updatedItems.push({
                ...item,
                result: itemResult,
                // Attach fixture details for the detailed table (score, time)
                fixtureDetails: fixture ? {
                    home: fixture.teams.home.name,
                    away: fixture.teams.away.name,
                    date: fixture.fixture.date,
                    status: fixture.fixture.status,
                    score: fixture.score.fulltime // 90 min score
                } : null
            });
        }

        // 3. Update Bet Status
        let newBetStatus = bet.status;
        if (["CONFIRMED", "PENDING_PAYMENT", "WON", "LOST"].includes(bet.status)) {
            if (anyItemLost) {
                newBetStatus = "LOST";
            } else if (allItemsResolved) {
                newBetStatus = "WON";
            }
        }

        if (newBetStatus !== bet.status) {
            const updatedBet = await prisma.bet.update({
                where: { id: bet.id },
                data: { status: newBetStatus }
            });
            return res.json({ bet: updatedBet, items: updatedItems });
        }

        res.json({ bet, items: updatedItems });

    } catch (error: any) {
        console.error("Check Results Error:", error);
        res.status(500).json({ error: "Failed to check results" });
    }
});

// PUT /api/bet/update
// Use to Edit Bet: Remove items, Update Stake, Persist Live Odds
router.put("/update", async (req, res) => {
    try {
        const { reference, keepItemIds, amount, updateOdds } = z.object({
            reference: z.string(),
            keepItemIds: z.array(z.string()), // CHANGED: Expect String IDs (UUIDs)
            amount: z.number().positive().optional(),
            updateOdds: z.boolean().optional() // If true, fetches live odds for items and updates DB
        }).parse(req.body);

        // 1. Fetch Bet
        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });

        if (!bet) return res.status(404).json({ error: "Bet not found" });
        if (bet.status !== 'PENDING_PAYMENT') return res.status(400).json({ error: "Cannot edit confirmed or processed bets" });

        // 2. Identify items to delete
        const currentIds = bet.items.map(i => i.id);
        const toDeleteIds = currentIds.filter(id => !keepItemIds.includes(id));

        if (keepItemIds.length === 0) {
            return res.status(400).json({ error: "Cannot remove all items. Cancel bet instead." });
        }

        // 3. Delete items
        if (toDeleteIds.length > 0) {
            await prisma.betItem.deleteMany({
                where: { id: { in: toDeleteIds } }
            });
        }

        // 4. Update Stake (if provided)
        if (amount) {
            await prisma.bet.update({
                where: { id: bet.id },
                data: { amount }
            });
        }

        // 5. Update Odds (if requested)
        if (updateOdds) {
            const remainingItems = await prisma.betItem.findMany({ where: { betId: bet.id } });

            for (const item of remainingItems) {
                try {
                    // Similar logic to GET /ticket but we SAVE it here
                    const oddsParams = new URLSearchParams();
                    oddsParams.set("fixture", item.fixtureId.toString());
                    const oRes = await apiFootballGet("/odds", oddsParams);

                    if (oRes.response && oRes.response.length > 0) {
                        const markets = oRes.response[0].bookmakers?.[0]?.bets || [];
                        const market = markets.find((m: any) => m.name === item.market || m.id.toString() === item.marketCode);
                        if (market) {
                            const selection = market.values.find((v: any) => v.value === item.selection || v.value === item.selectionCode);
                            if (selection) {
                                const liveOdd = parseFloat(selection.odd);
                                if (liveOdd !== item.oddValue) {
                                    await prisma.betItem.update({
                                        where: { id: item.id },
                                        data: { oddValue: liveOdd }
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to update odd for item ${item.id}`, e);
                }
            }
        }

        // 6. Final Recalculate & Return
        const finalItems = await prisma.betItem.findMany({ where: { betId: bet.id } });
        const newTotalOdds = finalItems.reduce((acc, item) => acc * item.oddValue, 1);

        const finalBet = await prisma.bet.update({
            where: { id: bet.id },
            data: { totalOdds: newTotalOdds, amount: amount || bet.amount }
        });

        res.json({ bet: finalBet, items: finalItems });

    } catch (error: any) {
        console.error("Update Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to update bet" });
    }
});

// POST /api/bet/clone
// Clones an existing bet into a new PENDING_PAYMENT bet with a new reference
router.post("/clone", async (req, res) => {
    try {
        const { originalReference } = z.object({ originalReference: z.string() }).parse(req.body);

        const originalBet = await prisma.bet.findUnique({
            where: { reference: originalReference },
            include: { items: true }
        });

        if (!originalBet) return res.status(404).json({ error: "Original bet not found" });

        // Create new bet using existing logic (but fully replicating items)
        const { bet, items } = await createAnonymousBet({
            amount: originalBet.amount,
            selections: originalBet.items.map(i => ({
                fixtureId: i.fixtureId,
                market: i.market,
                selection: i.selection,
                marketCode: i.marketCode || "LEGACY", // Provide fallback for nullable fields
                selectionCode: i.selectionCode || "LEGACY",
                line: null,
                oddValue: i.oddValue
            }))
        });

        res.status(201).json({ bet, items });

    } catch (error: any) {
        console.error("Clone Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to clone bet" });
    }
});

export default router;
