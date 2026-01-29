const crypto = require("crypto");
const { prisma } = require("./prisma");
// Remove type imports

class BettingError extends Error {
    constructor(message, code, changes = []) {
        super(message);
        this.name = "BettingError";
        this.code = code;
        this.changes = changes;
    }
}

// Generate bet reference (when bet is placed) - shorter format (8 digits numeric)
function generateReference() {
    // Generate random number between 10000000 and 99999999
    const num = crypto.randomInt(10000000, 100000000);
    return num.toString();
}

// Generate confirmation reference (when bet is confirmed) - longer format
function generateConfirmationReference() {
    // Also shorten confirmation if desired, but user specified "bet reference".
    // Let's keep confirmation distinct but maybe cleaner? 
    // User said "bet reference", usually means the ticket ID.
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString("hex").toUpperCase();
    const dateStr = new Date(timestamp).toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const checksum = (dateStr + random)
        .split("")
        .map((c) => c.charCodeAt(0))
        .reduce((sum, v) => sum + v, 0) % 999;
    return `CONF-${dateStr}-${random}-${checksum.toString().padStart(3, "0")}`;
}

function calculateTotalOdds(selections) {
    return selections.reduce((acc, cur) => acc * cur.oddValue, 1);
}

const { getFixtureOdds } = require("./oddsService");

async function createAnonymousBet(input) {
    if (input.selections.length === 0) {
        throw new Error("Bet must have at least one selection");
    }

    // Prevent duplicate selections for same fixture+market+selection
    const uniqueKey = new Set(
        input.selections.map(
            (s) => `${s.fixtureId}:${s.market.toLowerCase()}:${s.selection.toLowerCase()}`,
        ),
    );
    if (uniqueKey.size !== input.selections.length) {
        throw new Error("Duplicate selections are not allowed");
    }

    if (input.amount < 1) {
        throw new Error("Minimum stake is 1");
    }

    if (input.amount > 100000) {
        throw new Error("Maximum stake exceeded");
    }

    // ------------------------------------------------------------------
    // STRICT BACKEND VALIDATION
    // ------------------------------------------------------------------
    // Group selections by Fixture ID to minimize API calls
    const fixtureSelections = new Map();
    input.selections.forEach(s => {
        if (!fixtureSelections.has(s.fixtureId)) {
            fixtureSelections.set(s.fixtureId, []);
        }
        fixtureSelections.get(s.fixtureId).push(s);
    });

    // We collect ALL changes to return them to the user
    const changes = [];

    for (const [fixtureId, selections] of fixtureSelections.entries()) {
        // Fetch latest odds and status from Source of Truth
        // OPTIMIZATION: Use cached data (false) instead of forcing fresh fetch (true) to prevent timeouts
        const fixtureData = await getFixtureOdds(fixtureId, false);

        if (!fixtureData) {
            // Fixture completely missing/unavailable
            selections.forEach(s => {
                changes.push({
                    type: "MARKET_REMOVED", // Treat as removed market for frontend simplicity
                    fixtureId: fixtureId,
                    marketCode: s.marketCode,
                    selectionCode: s.selectionCode,
                    message: `Fixture ${fixtureId} is currently unavailable.`
                });
            });
            continue;
        }

        // 1. Validate Status
        const statusShort = fixtureData.status.short;
        const INVALID_STATUSES = ["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO", "SUSP"];
        if (INVALID_STATUSES.includes(statusShort)) {
            selections.forEach(s => {
                changes.push({
                    type: "MARKET_REMOVED", // Treat as removed market for frontend simplicity
                    fixtureId: fixtureId,
                    marketCode: s.marketCode,
                    selectionCode: s.selectionCode,
                    message: `Fixture ${fixtureId} is closed (Status: ${statusShort}).`
                });
            });
            continue;
        }

        // 2. Validate Odds
        for (const selection of selections) {
            const market = fixtureData.markets.find((m) => m.marketCode === selection.marketCode);

            if (!market) {
                changes.push({
                    type: "MARKET_REMOVED",
                    fixtureId: fixtureId,
                    marketCode: selection.marketCode,
                    selectionCode: selection.selectionCode,
                    message: `Market '${selection.market}' is no longer available.`
                });
                continue;
            }

            const betOption = market.bets.find((b) =>
                b.selectionCode === selection.selectionCode &&
                (b.line === selection.line || (b.line == null && selection.line == null))
            );

            if (!betOption) {
                changes.push({
                    type: "SELECTION_REMOVED",
                    fixtureId: fixtureId,
                    marketCode: selection.marketCode,
                    selectionCode: selection.selectionCode,
                    message: `Selection '${selection.selection}' is no longer available.`
                });
                continue;
            }

            const currentOdd = parseFloat(betOption.odd);
            const userOdd = selection.oddValue;

            if (Math.abs(currentOdd - userOdd) > 0.05) {
                changes.push({
                    type: "ODDS_CHANGED",
                    fixtureId: fixtureId,
                    marketCode: selection.marketCode,
                    selectionCode: selection.selectionCode,
                    line: selection.line,
                    oldOdd: userOdd,
                    newOdd: currentOdd,
                    message: `Odds changed for ${selection.selection}: ${userOdd} -> ${currentOdd}`
                });
            }
        }
    }

    if (changes.length > 0) {
        throw new BettingError("Odds/Status have changed", "ODDS_CHANGED", changes);
    }

    const totalOdds = calculateTotalOdds(input.selections);

    // RETRY LOOP FOR UNIQUE REFERENCE
    let bet = null;
    let retries = 0;
    while (!bet && retries < 5) {
        try {
            const reference = generateReference();
            // Create bet WITHOUT user ID for anonymous/public betting
            // Status is PENDING_PAYMENT until cashier confirms it
            bet = await prisma.bet.create({
                data: {
                    reference,
                    amount: input.amount,
                    totalOdds,
                    status: "PENDING_PAYMENT", // Cashier must confirm
                    // confirmedAt will be set when cashier confirms
                },
            });
        } catch (e) {
            if (e.code === 'P2002') {
                // Unique constraint failed, retry
                retries++;
                continue;
            }
            throw e;
        }
    }

    if (!bet) {
        throw new Error("Failed to generate unique bet reference");
    }

    const items = await Promise.all(
        input.selections.map((s) =>
            prisma.betItem.create({
                data: {
                    betId: bet.id,
                    fixtureId: s.fixtureId,
                    market: s.market,
                    selection: s.selection,
                    marketCode: s.marketCode,
                    selectionCode: s.selectionCode,
                    line: s.line,
                    oddValue: s.oddValue,
                },
            }),
        ),
    );

    return { bet, items };
}

module.exports = {
    BettingError,
    createAnonymousBet,
    calculateTotalOdds
};
