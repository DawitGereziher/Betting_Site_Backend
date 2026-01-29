"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bets_1 = require("../lib/bets");
const prisma_1 = require("../lib/prisma");
const apiFootball_1 = require("../lib/apiFootball");
const router = (0, express_1.Router)();
// --- Schemas ---
const selectionSchema = zod_1.z.object({
    fixtureId: zod_1.z.number().int(),
    market: zod_1.z.string().min(1),
    selection: zod_1.z.string().min(1),
    marketCode: zod_1.z.string().min(1),
    selectionCode: zod_1.z.string().min(1),
    line: zod_1.z.number().nullable(),
    oddValue: zod_1.z.number().positive(),
});
const createBetSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    selections: zod_1.z.array(selectionSchema),
});
const ticketSchema = zod_1.z.object({
    reference: zod_1.z.string().min(8),
});
const checkSchema = zod_1.z.object({
    reference: zod_1.z.string().min(8),
});
const resultChecker_1 = require("../lib/resultChecker");
// --- Routes ---
// POST /api/bet/create
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, selections } = createBetSchema.parse(req.body);
        const { bet, items } = yield (0, bets_1.createAnonymousBet)({ amount, selections });
        res.status(201).json({ bet, items });
    }
    catch (error) {
        console.error("Create Bet Error:", error);
        if (error.name === "BettingError") {
            res.status(409).json({
                error: error.message,
                changes: error.changes,
                code: error.code
            });
        }
        else {
            res.status(400).json({ error: error.message || "Failed to create bet" });
        }
    }
}));
// GET /api/bet/ticket?reference=...
router.get("/ticket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const reference = req.query.reference;
        const { reference: ref } = ticketSchema.parse({ reference });
        const bet = yield prisma_1.prisma.bet.findUnique({
            where: { reference: ref },
            include: { items: true },
        });
        if (!bet) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        // Fetch fixtures and fresh odds for details
        const fixtureIds = bet.items.map((item) => item.fixtureId);
        const fixtures = [];
        // Map items to their fresh data
        // We will attach 'currentOdd' and 'isStarted' to the items in the response
        const enrichedItems = [];
        for (const item of bet.items) {
            let fixtureData = null;
            let currentOdd = item.oddValue; // Default to booked odd
            let isStarted = false;
            try {
                // 1. Fetch Fixture Status
                const params = new URLSearchParams();
                params.set("id", item.fixtureId.toString());
                // We ask for 'timezone' if needed, but default is UTC usually.
                // Note: Calling API for EVERY item individually is slow (N+1). 
                // Optimization: Fetch unique fixtures in parallel. 
                // For MVP/Demo I will keep it simple but be aware of rate limits.
                // Check if we already fetched this fixture in this loop (optimization)
                const existing = fixtures.find(f => f.fixture.id === item.fixtureId);
                if (existing) {
                    fixtureData = existing;
                }
                else {
                    const fRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", params);
                    if (fRes.response && fRes.response.length > 0) {
                        fixtureData = fRes.response[0];
                        fixtures.push(fixtureData);
                    }
                }
                if (fixtureData) {
                    const status = fixtureData.fixture.status.short;
                    // NS = Not Started. Anything else (LIVE, ft, etc.) is considered 'started' for betting purposes mostly
                    if (status !== 'NS' && status !== 'TBD') {
                        isStarted = true;
                    }
                    // 2. Fetch Fresh Odds (Only if not started, or for display)
                    // We need to call /odds endpoint for this fixture
                    if (!isStarted) {
                        try {
                            // This might be heavy. 
                            // We are looking for marketCode and selectionCode match.
                            // NOTE: Free API tier limit.
                            const oddsParams = new URLSearchParams();
                            oddsParams.set("fixture", item.fixtureId.toString());
                            // oddsParams.set("bookmaker", "1"); // Bet365 usually
                            const oRes = yield (0, apiFootball_1.apiFootballGet)("/odds", oddsParams);
                            if (oRes.response && oRes.response.length > 0) {
                                const markets = ((_b = (_a = oRes.response[0].bookmakers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.bets) || [];
                                // Try to match market
                                // We saved 'marketCode' e.g. 'MATCH_WINNER'
                                // The API returns distinct IDs/names. 
                                // Mapping is tricky without a stored ID. 
                                // Let's assume we match by Name or Code if available.
                                // Our frontend saved 'marketCode' which matches API 'id' or mapped internal code?
                                // In frontend/src/lib/markets.ts we mapped legacy API structure.
                                // Simplified: Try to find a market with same name as saved 'market' string
                                // or use saved 'marketCode' if it corresponds to API ID.
                                // Actually, 'item.market' is the human readable name.
                                // Let's fallback to no-change if complicated. 
                                // User said "it brings real time odd".
                                // Let's try to find matching market by name
                                const market = markets.find((m) => m.name === item.market || m.id.toString() === item.marketCode);
                                if (market) {
                                    const selection = market.values.find((v) => v.value === item.selection || v.value === item.selectionCode);
                                    if (selection) {
                                        currentOdd = parseFloat(selection.odd);
                                    }
                                }
                            }
                        }
                        catch (e) {
                            console.warn("Failed to fetch odds for item", item.id);
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Failed to fetch details for fixture ${item.fixtureId}`, error);
            }
            // Append enriched data to item (we won't save it to DB yet, just return to UI)
            enrichedItems.push(Object.assign(Object.assign({}, item), { currentOdd,
                isStarted }));
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
    }
    catch (error) {
        console.error("Get Ticket Error:", error);
        res.status(500).json({ error: "Failed to get ticket" });
    }
}));
// POST /api/bet/check
// Publicly trigger a result check for a bet
router.post("/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = checkSchema.parse(req.body);
        const bet = yield prisma_1.prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });
        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }
        // Logic similar to cashier check-slip
        let allItemsResolved = true;
        let anyItemLost = false;
        const updatedItems = [];
        const fixturesMap = {};
        // 1. Fetch Fixtures
        const fixtureIds = [...new Set(bet.items.map(i => i.fixtureId))];
        yield Promise.all(fixtureIds.map((fid) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const params = new URLSearchParams();
                params.set("id", fid.toString());
                const fRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", params);
                if (fRes.response && fRes.response.length > 0) {
                    fixturesMap[fid] = fRes.response[0];
                }
            }
            catch (e) {
                console.error(`Failed to fetch fixture ${fid}`, e);
            }
        })));
        // 2. Check Items
        for (const item of bet.items) {
            const fixture = fixturesMap[item.fixtureId];
            let itemResult = item.result;
            if (fixture) {
                const checkRes = (0, resultChecker_1.checkItemResult)(item.marketCode || "UNKNOWN", item.selectionCode || "", item.line, fixture, item.oddValue);
                if (checkRes === "WON")
                    itemResult = "WON";
                else if (checkRes === "LOST") {
                    itemResult = "LOST";
                    anyItemLost = true;
                }
                else if (checkRes === "VOID")
                    itemResult = "VOID";
                else
                    allItemsResolved = false;
                // Update DB if changed
                if (itemResult !== item.result) {
                    yield prisma_1.prisma.betItem.update({
                        where: { id: item.id },
                        data: { result: itemResult }
                    });
                }
            }
            else {
                allItemsResolved = false;
            }
            // Return enriched item for Frontend Display
            updatedItems.push(Object.assign(Object.assign({}, item), { result: itemResult, 
                // Attach fixture details for the detailed table (score, time)
                fixtureDetails: fixture ? {
                    home: fixture.teams.home.name,
                    away: fixture.teams.away.name,
                    date: fixture.fixture.date,
                    status: fixture.fixture.status,
                    score: fixture.score.fulltime // 90 min score
                } : null }));
        }
        // 3. Update Bet Status
        let newBetStatus = bet.status;
        if (["CONFIRMED", "PENDING_PAYMENT", "WON", "LOST"].includes(bet.status)) {
            if (anyItemLost) {
                newBetStatus = "LOST";
            }
            else if (allItemsResolved) {
                newBetStatus = "WON";
            }
        }
        if (newBetStatus !== bet.status) {
            const updatedBet = yield prisma_1.prisma.bet.update({
                where: { id: bet.id },
                data: { status: newBetStatus }
            });
            return res.json({ bet: updatedBet, items: updatedItems });
        }
        res.json({ bet, items: updatedItems });
    }
    catch (error) {
        console.error("Check Bet Error:", error);
        res.status(500).json({ error: "Failed to check bet" });
    }
}));
// PUT /api/bet/update
// Use to Edit Bet: Remove items, Update Stake, Persist Live Odds
router.put("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { reference, keepItemIds, amount, updateOdds } = zod_1.z.object({
            reference: zod_1.z.string(),
            keepItemIds: zod_1.z.array(zod_1.z.string()), // CHANGED: Expect String IDs (UUIDs)
            amount: zod_1.z.number().positive().optional(),
            updateOdds: zod_1.z.boolean().optional() // If true, fetches live odds for items and updates DB
        }).parse(req.body);
        // 1. Fetch Bet
        const bet = yield prisma_1.prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });
        if (!bet)
            return res.status(404).json({ error: "Bet not found" });
        if (bet.status !== 'PENDING_PAYMENT')
            return res.status(400).json({ error: "Cannot edit confirmed or processed bets" });
        // 2. Identify items to delete
        const currentIds = bet.items.map(i => i.id);
        const toDeleteIds = currentIds.filter(id => !keepItemIds.includes(id));
        if (keepItemIds.length === 0) {
            return res.status(400).json({ error: "Cannot remove all items. Cancel bet instead." });
        }
        // 3. Delete items
        if (toDeleteIds.length > 0) {
            yield prisma_1.prisma.betItem.deleteMany({
                where: { id: { in: toDeleteIds } }
            });
        }
        // 4. Update Stake (if provided)
        if (amount) {
            yield prisma_1.prisma.bet.update({
                where: { id: bet.id },
                data: { amount }
            });
        }
        // 5. Update Odds (if requested)
        if (updateOdds) {
            const remainingItems = yield prisma_1.prisma.betItem.findMany({ where: { betId: bet.id } });
            for (const item of remainingItems) {
                try {
                    // Similar logic to GET /ticket but we SAVE it here
                    const oddsParams = new URLSearchParams();
                    oddsParams.set("fixture", item.fixtureId.toString());
                    const oRes = yield (0, apiFootball_1.apiFootballGet)("/odds", oddsParams);
                    if (oRes.response && oRes.response.length > 0) {
                        const markets = ((_b = (_a = oRes.response[0].bookmakers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.bets) || [];
                        const market = markets.find((m) => m.name === item.market || m.id.toString() === item.marketCode);
                        if (market) {
                            const selection = market.values.find((v) => v.value === item.selection || v.value === item.selectionCode);
                            if (selection) {
                                const liveOdd = parseFloat(selection.odd);
                                if (liveOdd !== item.oddValue) {
                                    yield prisma_1.prisma.betItem.update({
                                        where: { id: item.id },
                                        data: { oddValue: liveOdd }
                                    });
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn(`Failed to update odd for item ${item.id}`, e);
                }
            }
        }
        // 6. Final Recalculate & Return
        const finalItems = yield prisma_1.prisma.betItem.findMany({ where: { betId: bet.id } });
        const newTotalOdds = finalItems.reduce((acc, item) => acc * item.oddValue, 1);
        const finalBet = yield prisma_1.prisma.bet.update({
            where: { id: bet.id },
            data: { totalOdds: newTotalOdds, amount: amount || bet.amount }
        });
        res.json({ bet: finalBet, items: finalItems });
    }
    catch (error) {
        console.error("Update Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to update bet" });
    }
}));
// POST /api/bet/clone
// Clones an existing bet into a new PENDING_PAYMENT bet with a new reference
router.post("/clone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { originalReference } = zod_1.z.object({ originalReference: zod_1.z.string() }).parse(req.body);
        const originalBet = yield prisma_1.prisma.bet.findUnique({
            where: { reference: originalReference },
            include: { items: true }
        });
        if (!originalBet)
            return res.status(404).json({ error: "Original bet not found" });
        // Create new bet using existing logic (but fully replicating items)
        const { bet, items } = yield (0, bets_1.createAnonymousBet)({
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
    }
    catch (error) {
        console.error("Clone Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to clone bet" });
    }
}));
exports.default = router;
