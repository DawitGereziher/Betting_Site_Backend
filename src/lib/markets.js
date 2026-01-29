// Market normalization and filtering according to strict betting market rules
// REFACTORED: Strict API-Football structure, Single Bookmaker, No Renaming

// Map market names to market codes (Internal Use Only for Bet Placement/Settlement)
function getMarketCode(apiName) {
    const lower = apiName.toLowerCase();

    if (lower === "match winner" || lower === "match result" || lower === "1x2") return "MATCH_WINNER";
    if (lower === "double chance") return "DOUBLE_CHANCE";
    if (lower.includes("both teams score") || lower.includes("both teams to score") || lower === "btts") return "BTTS";
    if (lower.includes("home team total") || lower === "total - home") return "HOME_TEAM_TOTAL";
    if (lower.includes("away team total") || lower === "total - away") return "AWAY_TEAM_TOTAL";
    if (lower.includes("goals over/under") || lower.includes("total goals")) return "TOTAL_GOALS";
    if (lower === "draw no bet") return "DRAW_NO_BET";
    if (lower.includes("asian handicap")) return "ASIAN_HANDICAP";
    if (lower.includes("handicap") && !lower.includes("asian")) return "EUROPEAN_HANDICAP";
    if (lower === "first half winner") return "FIRST_HALF_WINNER";
    if (lower.includes("first half") && (lower.includes("goals") || lower.includes("over/under"))) return "FIRST_HALF_GOALS";
    if (lower.includes("second half") && (lower.includes("goals") || lower.includes("over/under"))) return "SECOND_HALF_GOALS";
    if (lower === "second half winner") return "SECOND_HALF_WINNER";
    if (lower.includes("ht/ft") || lower.includes("half-time/full-time")) return "HALF_TIME_FULL_TIME";
    if (lower.includes("correct score") || lower.includes("exact score")) return "EXACT_SCORE";
    if (lower.includes("odd/even")) return "MATCH_GOALS_ODD_EVEN";
    if (lower.includes("clean sheet") || lower.includes("to win to nil")) {
        // Logic for Clean Sheet / Win to Nil
        if (lower.includes("home")) return lower.includes("clean sheet") ? "CLEAN_SHEET_HOME" : "WIN_TO_NIL_HOME";
        if (lower.includes("away")) return lower.includes("clean sheet") ? "CLEAN_SHEET_AWAY" : "WIN_TO_NIL_AWAY";
    }
    // Re-checking Win to Nil explicitly if above missed
    if (lower.includes("win to nil")) return lower.includes("home") ? "WIN_TO_NIL_HOME" : "WIN_TO_NIL_AWAY";
    if (lower.includes("highest scoring half")) return "HIGHEST_SCORING_HALF";

    return "UNKNOWN";
}

// Map selection values to selection codes (Internal Use Only)
function getSelectionCode(
    value, // Allow loose types
    marketCode,
    marketName = "" // Added marketName for fallback line extraction
) {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return { code: "", line: null };
    }

    // Ensure string
    const valStr = String(value);
    const lower = valStr.toLowerCase().trim();

    // MATCH_WINNER / FIRST_HALF_WINNER / SECOND_HALF_WINNER
    if (marketCode === "MATCH_WINNER" || marketCode === "FIRST_HALF_WINNER" || marketCode === "SECOND_HALF_WINNER") {
        if (lower === "home") return { code: "HOME", line: null };
        if (lower === "draw") return { code: "DRAW", line: null };
        if (lower === "away") return { code: "AWAY", line: null };
    }

    // DOUBLE_CHANCE
    if (marketCode === "DOUBLE_CHANCE") {
        if (lower.includes("home") && lower.includes("draw")) return { code: "1X", line: null };
        if (lower.includes("home") && lower.includes("away")) return { code: "12", line: null };
        if (lower.includes("away") && lower.includes("draw")) return { code: "X2", line: null };
    }

    // BTTS / Clean Sheet / Win To Nil (YES/NO Markets)
    if (marketCode === "BTTS" || marketCode.includes("CLEAN_SHEET") || marketCode.includes("WIN_TO_NIL")) {
        if (lower === "yes") return { code: "YES", line: null };
        if (lower === "no") return { code: "NO", line: null };
    }

    // TOTAL_GOALS
    // TOTAL_GOALS / TEAM TOTALS
    if (marketCode === "TOTAL_GOALS" || marketCode === "HOME_TEAM_TOTAL" || marketCode === "AWAY_TEAM_TOTAL" || marketCode.includes("FIRST_HALF_GOALS") || marketCode.includes("SECOND_HALF_GOALS")) {
        const isOver = lower.includes("over");
        const isUnder = lower.includes("under");

        // Try extracting line from selection first (e.g. "Over 2.5")
        let match = valStr.match(/(\d+\.?\d*)/);
        let line = match ? parseFloat(match[1]) : null;

        // If no line in selection, try extracting from market name (e.g. "Over/Under 2.5 Goals")
        if (line === null && marketName) {
            match = marketName.match(/(\d+\.?\d*)/);
            line = match ? parseFloat(match[1]) : null;
        }

        if (isOver) return { code: "OVER", line };
        if (isUnder) return { code: "UNDER", line };
    }

    // ASIAN_HANDICAP / EUROPEAN_HANDICAP
    // Examples: "Home -1", "Away +0.5", "Draw -1"
    if (marketCode === "ASIAN_HANDICAP" || marketCode === "EUROPEAN_HANDICAP") {
        const isHome = lower.includes("home");
        const isAway = lower.includes("away");
        const isDraw = lower.includes("draw");

        // Extract number. Supports negative and positive. 
        // Regex: look for a number (integer or decimal) potentially preceded by + or -
        // Note: The input might be "Home -1". Match "-1". "Home +1" Match "+1".
        let match = valStr.match(/([+-]?\d+\.?\d*)/);
        let line = match ? parseFloat(match[1]) : null;

        // Fallback to market name if selection has no number (e.g. market "Asian Handicap -1.5", selection "Home")
        if (line === null && marketName) {
            match = marketName.match(/([+-]?\d+\.?\d*)/);
            line = match ? parseFloat(match[1]) : null;
        }

        if (isHome) return { code: "HOME", line };
        if (isAway) return { code: "AWAY", line };
        if (isDraw) return { code: "DRAW", line };
    }

    return { code: valStr, line: null };
}

function normalizeMarkets(apiResponse) {
    if (!apiResponse?.response || !Array.isArray(apiResponse.response) || apiResponse.response.length === 0) {
        return [];
    }

    // 1. FIXTURE LEVEL
    // "One element = one match"
    const fixture = apiResponse.response[0];
    if (!fixture || !fixture.bookmakers || !Array.isArray(fixture.bookmakers)) {
        return [];
    }

    // 2. BOOKMAKER LEVEL - SINGLE BOOKMAKER RULE
    // "Select ONE bookmaker only (e.g. Bet365)" "Do NOT merge bookmakers"
    // Priority: 10Bet (1), Bet365 (8), Bwin (6), Unibet (11)
    const preferredBookmakers = [1, 8, 6, 11];
    let selectedBookmaker = fixture.bookmakers.find((b) => preferredBookmakers.includes(b.id));

    // Fallback to first if preferred not found
    if (!selectedBookmaker && fixture.bookmakers.length > 0) {
        selectedBookmaker = fixture.bookmakers[0];
    }

    if (!selectedBookmaker || !selectedBookmaker.bets) {
        return [];
    }

    const markets = [];

    // 3. MARKET LEVEL (bets[])
    for (const bet of selectedBookmaker.bets) {
        const marketName = bet.name;

        // NO FILTERING - SHOW ALL MARKETS
        // User instruction: "list them all"

        // 4. SELECTION LEVEL (values[])
        const selections = bet.values.map((val) => {
            // "value = selection label (dynamic)"
            // "odd = decimal odd (string -> convert to float)"
            const label = val.value !== null && val.value !== undefined ? String(val.value) : "";
            const marketCode = getMarketCode(marketName);
            // PASS MARKET NAME for fallback line extraction
            const { code, line } = getSelectionCode(label, marketCode, marketName);

            return {
                label: label,
                value: label,
                selectionCode: code, // Internal use only
                odd: parseFloat(val.odd),
                line: line
            };
        });

        // "Do NOT rename markets"
        markets.push({
            id: `${selectedBookmaker.id}-${bet.id}`,
            category: "POPULAR", // Default category matching existing UI assumption
            name: marketName,
            description: "", // No custom description, "Display exactly as API returns"
            marketCode: getMarketCode(marketName),
            selections: selections,
            priority: 1
        });
    }

    return markets;
}

module.exports = {
    getMarketCode,
    getSelectionCode,
    normalizeMarkets
};
