"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const apiFootball_1 = require("../lib/apiFootball");
const router = express_1.default.Router();
// --- Schemas ---
const cancelSchema = zod_1.z.object({
    reference: zod_1.z.string().min(1),
});
const payoutSchema = zod_1.z.object({
    reference: zod_1.z.string().min(1),
    // userId: z.string().optional(), // In real app, get from auth middleware
});
const dashboardSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});
// Middleware to ensure user is Cashier/Admin would go here.
// POST /cancel
// Cancel a bet if within 10 minutes and games haven't started
router.post("/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = cancelSchema.parse(req.body);
        const bet = yield prisma_1.prisma.bet.findUnique({
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
                const fRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", params);
                if (fRes.response && fRes.response.length > 0) {
                    const fixture = fRes.response[0];
                    const status = fixture.fixture.status.short;
                    if (status !== "NS" && status !== "TBD") {
                        return res.status(400).json({ error: `Game ${fixture.teams.home.name} vs ${fixture.teams.away.name} has already started.` });
                    }
                }
            }
            catch (error) {
                console.error(`Status check failed for fixture ${item.fixtureId}`, error);
                return res.status(500).json({ error: "Failed to verify game status. Cannot cancel." });
            }
        }
        // 3. Cancel Bet
        const updatedBet = yield prisma_1.prisma.bet.update({
            where: { id: bet.id },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
            },
        });
        res.json({ message: "Bet cancelled successfully", bet: updatedBet });
    }
    catch (error) {
        console.error("Cancel Bet Error:", error);
        res.status(400).json({ error: error.message || "Failed to cancel bet" });
    }
}));
// POST /payout
// Mark a WON bet as PAID
router.post("/payout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Enforce cashierId check
        const schema = zod_1.z.object({
            reference: zod_1.z.string().min(1),
            cashierId: zod_1.z.string().min(1, "Cashier ID required")
        });
        const { reference, cashierId } = schema.parse(req.body);
        const bet = yield prisma_1.prisma.bet.findUnique({
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
        const updatedBet = yield prisma_1.prisma.bet.update({
            where: { id: bet.id },
            data: {
                status: "PAID",
                paidAt: new Date(),
                payoutAmount: bet.amount * bet.totalOdds,
                paidByUserId: cashierId, // Record who processed the payout
            },
        });
        res.json({ message: "Payout successful", bet: updatedBet });
    }
    catch (error) {
        console.error("Payout Error:", error);
        res.status(400).json({ error: error.message || "Failed to process payout" });
    }
}));
// GET /dashboard?date=YYYY-MM-DD
router.get("/dashboard", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = dashboardSchema.parse(req.query);
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);
        // 1. Total Received
        const incomingBets = yield prisma_1.prisma.bet.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ["CONFIRMED", "WON", "LOST", "PAID"] }
            }
        });
        const totalReceived = incomingBets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalSlips = incomingBets.length;
        // 2. Total Paid
        const paidBets = yield prisma_1.prisma.bet.findMany({
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
    }
    catch (error) {
        console.error("Dashboard Error:", error);
        res.status(400).json({ error: error.message || "Failed to get dashboard stats" });
    }
}));
// Get Cashier Stats (Personal)
// Requires `?cashierId=...` for now, or extract from token middleware later
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cashierId = req.query.cashierId;
    if (!cashierId) {
        return res.status(400).json({ error: 'Cashier ID required' });
    }
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalRevenue = yield prisma_1.prisma.bet.aggregate({
            where: {
                cashierId: cashierId,
                createdAt: { gte: today }
            },
            _sum: { amount: true },
        });
        const recentBets = yield prisma_1.prisma.bet.findMany({
            where: { cashierId: cashierId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        res.json({
            dailyRevenue: totalRevenue._sum.amount || 0,
            recentBets,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashier stats' });
    }
}));
// Confirm Bet / "Print Ticket"
// Cashier enters a reference (from user) -> We link it to cashier and mark confirmed
router.post('/confirm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reference, cashierId } = req.body;
    if (!reference) {
        return res.status(400).json({ error: 'Reference required' });
    }
    try {
        const bet = yield prisma_1.prisma.bet.findUnique({
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
            const cashier = yield prisma_1.prisma.user.findUnique({
                where: { id: cashierId }
            });
            if (cashier) {
                validCashierId = cashierId;
            }
        }
        // Update bet to Confirmed and link Cashier (if valid)
        const updatedBet = yield prisma_1.prisma.bet.update({
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
    }
    catch (error) {
        console.error('Confirm bet error:', error);
        res.status(500).json({ error: 'Failed to confirm bet' });
    }
}));
// --- Result Checking ---
const resultChecker_1 = require("../lib/resultChecker");
// POST /check-slip
// Manually trigger a result check for a specific bet reference
router.post("/check-slip", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reference } = req.body;
    if (!reference) {
        return res.status(400).json({ error: "Reference required" });
    }
    try {
        const bet = yield prisma_1.prisma.bet.findUnique({
            where: { reference },
            include: { items: true }
        });
        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }
        if (bet.status === "CANCELLED" || bet.status === "PAID" || bet.status === "LOST") {
            // Optional: allow re-check if needed, but usually we stop here
            // For dev/testing, let's allow re-checking CONFIRMED/PENDING/WON/LOST bets
            if (bet.status === "CANCELLED")
                return res.status(400).json({ error: "Bet is cancelled" });
        }
        let allItemsResolved = true;
        let allItemsWon = true; // Optimistic start
        let anyItemLost = false;
        const updatedItems = [];
        // Group items by fixture to minimize API calls
        const fixtureIds = [...new Set(bet.items.map(i => i.fixtureId))];
        const fixturesMap = {};
        // Fetch fixtures in parallel
        yield Promise.all(fixtureIds.map((fid) => __awaiter(void 0, void 0, void 0, function* () {
            const params = new URLSearchParams();
            params.set("id", fid.toString());
            try {
                // Try Force refresh first to get latest result
                const fRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", params, 60000, true);
                if (fRes.response && fRes.response.length > 0) {
                    fixturesMap[fid] = fRes.response[0];
                }
            }
            catch (e) {
                console.warn(`Force refresh failed for fixture ${fid}, trying cache...`, e);
                // Fallback to cache without force refresh
                try {
                    const fResCache = yield (0, apiFootball_1.apiFootballGet)("/fixtures", params, 60000, false);
                    if (fResCache.response && fResCache.response.length > 0) {
                        fixturesMap[fid] = fResCache.response[0];
                    }
                }
                catch (e2) {
                    console.error(`Failed to fetch fixture ${fid} from cache too`, e2);
                }
            }
        })));
        // Check each item
        // Import metadata cache
        const { getFixtureMetadata } = yield Promise.resolve().then(() => __importStar(require("../lib/fixtureMetadataCache")));
        for (const item of bet.items) {
            const fixture = fixturesMap[item.fixtureId];
            let itemResult = item.result; // Use 'result' field
            // FALLBACK: If API doesn't have fixture, try permanent cache for details
            let fallbackDetails = null;
            if (fixture) {
                // Check result
                const checkRes = (0, resultChecker_1.checkItemResult)(item.marketCode || "UNKNOWN", // Handle null
                item.selectionCode || "", item.line, fixture, item.oddValue, item.market, // Fallback: Raw Market Name
                item.selection // Fallback: Raw Selection Name
                );
                if (checkRes === "WON") {
                    itemResult = "WON";
                }
                else if (checkRes === "LOST") {
                    itemResult = "LOST";
                    anyItemLost = true;
                }
                else if (checkRes === "VOID") {
                    itemResult = "VOID";
                    // For logic: VOID usually means odd=1.0, doesn't kill the accumulator
                }
                else {
                    // PENDING
                    allItemsResolved = false;
                }
                if (itemResult !== item.result) {
                    // Update item in DB
                    yield prisma_1.prisma.betItem.update({
                        where: { id: item.id },
                        data: { result: itemResult } // Update 'result'
                    });
                }
            }
            else {
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
            updatedItems.push(Object.assign(Object.assign({}, item), { result: itemResult, fixtureDetails: fixture ? {
                    home: fixture.teams.home.name,
                    away: fixture.teams.away.name,
                    date: fixture.fixture.date,
                    status: fixture.fixture.status,
                    score: fixture.score.fulltime
                } : fallbackDetails }));
        }
        // Determine Bet Status
        let newBetStatus = bet.status;
        if (anyItemLost) {
            newBetStatus = "LOST";
        }
        else if (allItemsResolved) {
            // If no items lost and all resolved -> WON (or VOID implies win with reduced odds)
            // We need to handle VOID logic correctly (recalc odds), but for now mostly WON
            newBetStatus = "WON";
        }
        // Else logic: If some pending, stay pending/confirmed.
        if (newBetStatus !== bet.status) {
            const updatedBet = yield prisma_1.prisma.bet.update({
                where: { id: bet.id },
                data: { status: newBetStatus }
            });
            return res.json({ bet: updatedBet, items: updatedItems, message: `Bet updated to ${newBetStatus}` });
        }
        res.json({ bet, items: updatedItems, message: "Status unchecked/unchanged" });
    }
    catch (error) {
        console.error("Check slip error:", error);
        res.status(500).json({ error: "Failed to check slip" });
    }
}));
exports.default = router;
