const express = require('express');
const { prisma } = require('../lib/prisma');
const { z } = require("zod");
const { apiFootballGet } = require("../lib/apiFootball");
const { checkItemResult } = require("../lib/resultChecker");

const router = express.Router();

// --- Schemas ---
const cancelSchema = z.object({
    reference: z.string().min(1),
});

const payoutSchema = z.object({
    reference: z.string().min(1),
    // userId: z.string().optional(), // In real app, get from auth middleware
});

const dashboardSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

// Middleware to ensure user is Cashier/Admin would go here.

// POST /cancel
// Cancel a bet if within 10 minutes and games haven't started
router.post("/cancel", async (req, res) => {
    try {
        const { reference } = cancelSchema.parse(req.body);

        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true },
        });

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        if (bet.status === "CANCELLED") {
            return res.status(400).json({ error: "Bet is already cancelled" });
        }

        if (bet.status !== "CONFIRMED" && bet.status !== "PENDING_PAYMENT") {
            return res.status(400).json({ error: "Only PENDING or CONFIRMED bets can be cancelled" });
        }

        // 1. Check 10 Minute Window
        const confirmTime = bet.confirmedAt ? new Date(bet.confirmedAt) : new Date(bet.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - confirmTime.getTime();
        const diffMins = diffMs / 60000;

        if (diffMins > 10) {
            return res.status(400).json({ error: "Cancellation period (10 mins) has expired" });
        }

        // 2. Check Game Status
        for (const item of bet.items) {
            try {
                const params = new URLSearchParams();
                params.set("id", item.fixtureId.toString());
                const fRes = await apiFootballGet("/fixtures", params);

                if (fRes.response && fRes.response.length > 0) {
                    const fixture = fRes.response[0];
                    const status = fixture.fixture.status.short;
                    if (status !== "NS" && status !== "TBD") {
                        return res.status(400).json({ error: `Game ${fixture.teams.home.name} vs ${fixture.teams.away.name} has already started.` });
                    }
                }
            } catch (error) {
                console.error(`Status check failed for fixture ${item.fixtureId}`, error);
                return res.status(500).json({ error: "Failed to verify game status. Cannot cancel." });
            }
        }

        // 3. Cancel Bet
        const updatedBet = await prisma.bet.update({
            where: { id: bet.id },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
            },
        });

        res.json({ message: "Bet cancelled successfully", bet: updatedBet });

    } catch (error) {
        console.error("Cancel Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to cancel bet" });
    }
});

// POST /payout
// Mark a WON bet as PAID
router.post("/payout", async (req, res) => {
    try {
        // Enforce cashierId check
        const schema = z.object({
            reference: z.string().min(1),
            cashierId: z.string().min(1, "Cashier ID required")
        });

        const { reference, cashierId } = schema.parse(req.body);

        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { cashier: true }
        });

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        // ENFORCE CASHIER OWNERSHIP
        if (bet.cashierId && bet.cashierId !== cashierId) {
            const ownerName = bet.cashier ? (bet.cashier.username || "another cashier") : "another cashier";
            return res.status(403).json({
                error: `Access Denied. This bet was confirmed by ${ownerName}. Only they can process the payout.`
            });
        }

        if (bet.status === "PAID") {
            return res.status(400).json({ error: "Bet already paid out" });
        }

        if (bet.status !== "WON") {
            return res.status(400).json({ error: "Only WON bets can be paid out. Check results first." });
        }

        // Perform Payout
        const updatedBet = await prisma.bet.update({
            where: { id: bet.id },
            data: {
                status: "PAID",
                paidAt: new Date(),
                payoutAmount: bet.amount * bet.totalOdds,
                paidByUserId: cashierId, // Record who processed the payout
            },
        });

        res.json({ message: "Payout successful", bet: updatedBet });

    } catch (error) {
        console.error("Payout Error:", error);
        res.status(400).json({ error: error.message || "Failed to process payout" });
    }
});

// GET /dashboard?date=YYYY-MM-DD
router.get("/dashboard", async (req, res) => {
    try {
        const { date } = dashboardSchema.parse(req.query);

        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);

        // 1. Total Received
        const incomingBets = await prisma.bet.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ["CONFIRMED", "WON", "LOST", "PAID"] }
            }
        });

        const totalReceived = incomingBets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalSlips = incomingBets.length;

        // 2. Total Paid
        const paidBets = await prisma.bet.findMany({
            where: {
                paidAt: { gte: startDate, lte: endDate },
                status: "PAID"
            }
        });

        const totalPaid = paidBets.reduce((sum, bet) => sum + (bet.payoutAmount || 0), 0);
        const payoutCount = paidBets.length;

        res.json({
            date,
            totalReceived,
            totalSlips,
            totalPaid,
            payoutCount,
            bets: incomingBets.map(bet => ({
                id: bet.id,
                reference: bet.reference,
                amount: bet.amount,
                totalOdds: bet.totalOdds,
                potentialWin: bet.amount * bet.totalOdds,
                status: bet.status,
                createdAt: bet.createdAt,
                confirmedAt: bet.confirmedAt,
                cashierId: bet.cashierId
            }))
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(400).json({ error: error.message || "Failed to get dashboard stats" });
    }
});

// Get Cashier Stats (Personal)
// Requires `?cashierId=...` for now, or extract from token middleware later
router.get('/stats', async (req, res) => {
    const cashierId = req.query.cashierId;

    if (!cashierId) {
        return res.status(400).json({ error: 'Cashier ID required' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalRevenue = await prisma.bet.aggregate({
            where: {
                cashierId: cashierId,
                createdAt: { gte: today }
            },
            _sum: { amount: true },
        });

        const recentBets = await prisma.bet.findMany({
            where: { cashierId: cashierId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        res.json({
            dailyRevenue: totalRevenue._sum.amount || 0,
            recentBets,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashier stats' });
    }
});

// Confirm Bet / "Print Ticket"
// Cashier enters a reference (from user) -> We link it to cashier and mark confirmed
router.post('/confirm', async (req, res) => {
    const { reference, cashierId } = req.body;

    if (!reference) {
        return res.status(400).json({ error: 'Reference required' });
    }

    try {
        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true, cashier: true }
        });

        if (!bet) {
            return res.status(404).json({ error: 'Bet not found' });
        }

        if (bet.status !== 'PENDING_PAYMENT') {
            // Include items for reprint
            return res.json(bet);
        }

        // Validate cashier exists if provided
        let validCashierId = null;
        if (cashierId && cashierId !== 'unknown') {
            const cashier = await prisma.user.findUnique({
                where: { id: cashierId }
            });
            if (cashier) {
                validCashierId = cashierId;
            }
        }

        // Update bet to Confirmed and link Cashier (if valid)
        const updatedBet = await prisma.bet.update({
            where: { reference },
            data: {
                status: 'CONFIRMED',
                cashierId: validCashierId, // Will be null if invalid/unknown
                confirmedAt: new Date(),
                confirmationReference: Date.now().toString()
            },
            include: { items: true }
        });

        res.json(updatedBet);
    } catch (error) {
        console.error('Confirm bet error:', error);
        res.status(500).json({ error: 'Failed to confirm bet' });
    }
});

// POST /check-slip
// Manually trigger a result check for a specific bet reference
router.post("/check-slip", async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ error: "Reference required" });
    }

    try {
        const bet = await prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        if (bet.status === "CANCELLED" || bet.status === "PAID" || bet.status === "LOST") {
            // Optional: allow re-check if needed, but usually we stop here
            // For dev/testing, let's allow re-checking CONFIRMED/PENDING/WON/LOST bets
            if (bet.status === "CANCELLED") return res.status(400).json({ error: "Bet is cancelled" });
        }

        let allItemsResolved = true;
        let anyItemLost = false;

        const updatedItems = [];

        // Group items by fixture to minimize API calls
        const fixtureIds = [...new Set(bet.items.map(i => i.fixtureId))];
        const fixturesMap = {};

        // Fetch fixtures in parallel
        await Promise.all(fixtureIds.map(async (fid) => {
            const params = new URLSearchParams();
            params.set("id", fid.toString());

            try {
                // Try Force refresh first to get latest result
                const fRes = await apiFootballGet("/fixtures", params, 60000, true);
                if (fRes.response && fRes.response.length > 0) {
                    fixturesMap[fid] = fRes.response[0];
                }
            } catch (e) {
                console.warn(`Force refresh failed for fixture ${fid}, trying cache...`, e);
                // Fallback to cache without force refresh
                try {
                    const fResCache = await apiFootballGet("/fixtures", params, 60000, false);
                    if (fResCache.response && fResCache.response.length > 0) {
                        fixturesMap[fid] = fResCache.response[0];
                    }
                } catch (e2) {
                    console.error(`Failed to fetch fixture ${fid} from cache too`, e2);
                }
            }
        }));

        // Check each item
        // Import metadata cache
        const { getFixtureMetadata } = require("../lib/fixtureMetadataCache");

        for (const item of bet.items) {
            const fixture = fixturesMap[item.fixtureId];
            let itemResult = item.result; // Use 'result' field

            // FALLBACK: If API doesn't have fixture, try permanent cache for details
            let fallbackDetails = null;

            if (fixture) {
                // Check result
                const checkRes = checkItemResult(
                    item.marketCode || "UNKNOWN", // Handle null
                    item.selectionCode || "",
                    item.line,
                    fixture,
                    item.oddValue,
                    item.market, // Fallback: Raw Market Name
                    item.selection // Fallback: Raw Selection Name
                );

                if (checkRes === "WON") {
                    itemResult = "WON";
                } else if (checkRes === "LOST") {
                    itemResult = "LOST";
                    anyItemLost = true;
                } else if (checkRes === "VOID") {
                    itemResult = "VOID";
                    // For logic: VOID usually means odd=1.0, doesn't kill the accumulator
                } else {
                    // PENDING
                    allItemsResolved = false;
                }

                if (itemResult !== item.result) {
                    // Update item in DB
                    await prisma.betItem.update({
                        where: { id: item.id },
                        data: { result: itemResult } // Update 'result'
                    });
                }
            } else {
                const cachedMetadata = getFixtureMetadata(item.fixtureId);
                if (cachedMetadata) {
                    console.log(`[POST /check-slip] Using cached metadata for fixture ${item.fixtureId}`);
                    fallbackDetails = {
                        home: cachedMetadata.home,
                        away: cachedMetadata.away,
                        date: cachedMetadata.date,
                        status: { short: 'UNK', long: 'Unknown Status' },
                        score: { home: null, away: null }
                    };
                }
                allItemsResolved = false; // Cannot resolving without fixture
            }

            updatedItems.push({
                ...item,
                result: itemResult,
                fixtureDetails: fixture ? {
                    home: fixture.teams.home.name,
                    away: fixture.teams.away.name,
                    date: fixture.fixture.date,
                    status: fixture.fixture.status,
                    score: fixture.score.fulltime
                } : fallbackDetails
            });
        }

        // Determine Bet Status
        let newBetStatus = bet.status;

        if (anyItemLost) {
            newBetStatus = "LOST";
        } else if (allItemsResolved) {
            // If no items lost and all resolved -> WON (or VOID implies win with reduced odds)
            // We need to handle VOID logic correctly (recalc odds), but for now mostly WON
            newBetStatus = "WON";
        }
        // Else logic: If some pending, stay pending/confirmed.

        if (newBetStatus !== bet.status) {
            const updatedBet = await prisma.bet.update({
                where: { id: bet.id },
                data: { status: newBetStatus }
            });
            return res.json({ bet: updatedBet, items: updatedItems, message: `Bet updated to ${newBetStatus}` });
        }

        res.json({ bet, items: updatedItems, message: "Status unchecked/unchanged" });

    } catch (error) {
        console.error("Check slip error:", error);
        res.status(500).json({ error: "Failed to check slip" });
    }
});

module.exports = router;
