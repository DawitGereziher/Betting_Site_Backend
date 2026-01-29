// Market normalization and filtering according to strict betting market rules
// REFACTORED: Strict API-Football structure, Single Bookmaker, No Renaming

export type MarketCategory = "POPULAR" | "GOALS" | "HANDICAPS" | "HALVES" | "SPECIALS" | "PLAYERS";

export type NormalizedMarket = {
  id: string;
  category: MarketCategory;
  name: string; // DISPLAY AS IS FROM API
  description: string;
  marketCode: string; // Still needed for internal logic / bet settlement
  selections: Array<{
    label: string; // DISPLAY AS IS FROM API
    value: string; // DISPLAY AS IS FROM API
    selectionCode: string; // Internal use
    odd: number;
    line?: number | null;
  }>;
  priority: number;
};

// Map market names to market codes (Internal Use Only for Bet Placement/Settlement)
export function getMarketCode(apiName: string): string {
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
  if (lower.includes("clean sheet")) return lower.includes("home") ? "CLEAN_SHEET_HOME" : "CLEAN_SHEET_AWAY";
  if (lower.includes("win to nil")) return lower.includes("home") ? "WIN_TO_NIL_HOME" : "WIN_TO_NIL_AWAY";
  if (lower.includes("highest scoring half")) return "HIGHEST_SCORING_HALF";

  return "UNKNOWN";
}

// Map selection values to selection codes (Internal Use Only)
export function getSelectionCode(
  value: string | number | null | undefined, // Allow loose types
  marketCode: string,
): { code: string; line: number | null } {
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
  if (marketCode === "TOTAL_GOALS" || marketCode === "HOME_TEAM_TOTAL" || marketCode === "AWAY_TEAM_TOTAL") {
    const isOver = lower.includes("over");
    const isUnder = lower.includes("under");

    const match = valStr.match(/(\d+\.?\d*)/);
    const line = match ? parseFloat(match[1]) : null;

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
    const match = valStr.match(/([+-]?\d+\.?\d*)/);
    const line = match ? parseFloat(match[1]) : null;

    if (isHome) return { code: "HOME", line };
    if (isAway) return { code: "AWAY", line };
    if (isDraw) return { code: "DRAW", line };
  }

  return { code: valStr, line: null };
}

export function normalizeMarkets(apiResponse: any): NormalizedMarket[] {
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
  let selectedBookmaker = fixture.bookmakers.find((b: any) => preferredBookmakers.includes(b.id));

  // Fallback to first if preferred not found
  if (!selectedBookmaker && fixture.bookmakers.length > 0) {
    selectedBookmaker = fixture.bookmakers[0];
  }

  if (!selectedBookmaker || !selectedBookmaker.bets) {
    return [];
  }

  const markets: NormalizedMarket[] = [];

  // 3. MARKET LEVEL (bets[])
  for (const bet of selectedBookmaker.bets) {
    const marketName = bet.name;

    // NO FILTERING - SHOW ALL MARKETS
    // User instruction: "list them all"

    // 4. SELECTION LEVEL (values[])
    const selections = bet.values.map((val: any) => {
      // "value = selection label (dynamic)"
      // "odd = decimal odd (string -> convert to float)"
      const label = val.value !== null && val.value !== undefined ? String(val.value) : "";
      const marketCode = getMarketCode(marketName);
      const { code, line } = getSelectionCode(label, marketCode);

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
