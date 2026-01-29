
import { ApiFixtureResponse } from "./apiFootball";

export type BetItemResult = "WON" | "LOST" | "VOID" | "PENDING";
export type BetStatus = "WON" | "LOST" | "VOID" | "PENDING";

export interface ItemCheckResult {
    itemId: string;
    result: BetItemResult;
    score?: string; // e.g. "2-1"
}

// Helper to normalize score lines
function getScores(fixture: ApiFixtureResponse) {
    const { score } = fixture;
    // STRICT 90-MINUTE RULE: Use score.fulltime ONLY.
    // Ensure we handle nulls (default to 0).
    // If status is FT, AET, or PEN, 'score.fulltime' should contain the 90-min result.
    const ftHome = score.fulltime.home ?? 0;
    const ftAway = score.fulltime.away ?? 0;
    const htHome = score.halftime.home ?? 0;
    const htAway = score.halftime.away ?? 0;

    return {
        ft: { home: ftHome, away: ftAway },
        ht: { home: htHome, away: htAway },
        // "Second Half" specific score is (FT - HT)
        secondHalf: {
            home: ftHome - htHome,
            away: ftAway - htAway
        }
    };
}

// Fallback Mappings (Based on User JSON)
// Fallback Mappings (Based on User JSON)
function getMarketCode(apiName: string): string {
    const lower = apiName.toLowerCase();

    // SPECIFIC / COMPLEX MARKETS FIRST (Prevent partial matching issues)

    // --- HALF TIME / FULL TIME ---
    if (lower.includes("ht/ft") || lower.includes("half-time/full-time") || lower.includes("ht/ft double")) return "HALF_TIME_FULL_TIME";

    // --- SCORING HALVES ---
    if (lower.includes("highest scoring half")) return "HIGHEST_SCORING_HALF";
    if (lower === "win both halves") return "WIN_BOTH_HALVES";

    // --- CORRECT SCORE ---
    if (lower.includes("correct score") || lower.includes("exact score")) {
        // Specific Halves
        if (lower.includes("first half") || lower.includes("1st half")) return "CORRECT_SCORE_FIRST_HALF";
        if (lower.includes("second half") || lower.includes("2nd half")) return "CORRECT_SCORE_SECOND_HALF";
        return "EXACT_SCORE"; // Full Time
    }

    // --- FIRST HALF MARKETS ---
    if (lower.includes("first half") || lower.includes("1st half")) {
        if (lower.includes("winner")) return "FIRST_HALF_WINNER";
        if (lower.includes("both teams") && (lower.includes("score") || lower.includes("btts"))) return "BTTS_FIRST_HALF";
        if (lower.includes("goals") || lower.includes("over/under") || lower.includes("total")) return "FIRST_HALF_GOALS";
        // Fallback for just "First Half"?
    }

    // --- SECOND HALF MARKETS ---
    if (lower.includes("second half") || lower.includes("2nd half")) {
        if (lower.includes("winner")) return "SECOND_HALF_WINNER";
        if (lower.includes("both teams") && (lower.includes("score") || lower.includes("btts"))) return "BTTS_SECOND_HALF";
        if (lower.includes("goals") || lower.includes("over/under") || lower.includes("total")) return "SECOND_HALF_GOALS";
    }

    // --- GENERIC GOALS (Full Time) ---
    // Check SPECIFIC Team goals first
    if (lower === "total - home" || lower.includes("home team total")) return "HOME_TEAM_TOTAL";
    if (lower === "total - away" || lower.includes("away team total")) return "AWAY_TEAM_TOTAL";

    // Now generic goals
    if (lower.includes("goals over/under") || lower.includes("total goals") || lower.includes("goal line")) return "TOTAL_GOALS";

    // --- MATCH WINNER / RESULT ---
    if (lower === "match winner" || lower === "match result" || lower === "1x2") return "MATCH_WINNER";

    // --- DRAW NO BET ---
    if (lower === "draw no bet" || lower === "home/away") return "DRAW_NO_BET"; // Fixed: Added Home/Away

    // --- DOUBLE CHANCE ---
    if (lower === "double chance") return "DOUBLE_CHANCE";

    // --- BTTS (Full Time) ---
    if (lower.includes("both teams score") || lower === "both teams to score" || lower === "btts") return "BTTS";

    // --- HANDICAPS ---
    if (lower.includes("asian handicap")) return "ASIAN_HANDICAP";
    if (lower.includes("handicap") && !lower.includes("asian")) return "EUROPEAN_HANDICAP";

    // --- SPECIALS / OTHERS ---
    if (lower.includes("odd/even")) return "MATCH_GOALS_ODD_EVEN";
    if (lower.includes("clean sheet") && lower.includes("home")) return "CLEAN_SHEET_HOME";
    if (lower.includes("clean sheet") && lower.includes("away")) return "CLEAN_SHEET_AWAY";
    if (lower.includes("win to nil") && lower.includes("home")) return "WIN_TO_NIL_HOME";
    if (lower.includes("win to nil") && lower.includes("away")) return "WIN_TO_NIL_AWAY";

    if (lower === "team to score first" || lower.includes("first team to score")) return "TEAM_TO_SCORE_FIRST";
    if (lower === "team to score last" || lower.includes("last team to score")) return "TEAM_TO_SCORE_LAST";

    // If we reach here, it's truly unknown
    return "UNKNOWN";
}

function getSelectionCode(value: any): string {
    const valStr = String(value);
    const lower = valStr.toLowerCase().trim();
    if (lower === "home") return "HOME";
    if (lower === "draw") return "DRAW";
    if (lower === "away") return "AWAY";
    if (lower === "yes") return "YES";
    if (lower === "no") return "NO";
    if (lower.includes("over")) return "OVER";
    if (lower.includes("under")) return "UNDER";
    // For Exact Score etc, keep as is (normalized later)
    return valStr.toUpperCase();
}

// Logic for each market
export function checkItemResult(
    marketCode: string,
    selectionCode: string,    // e.g. "HOME", "OVER", "1-0"
    line: number | null | undefined, // e.g. 2.5, -1.0
    fixture: ApiFixtureResponse,
    oddValue: number,
    // New params for fallback support
    marketName?: string,
    selectionName?: string
): BetItemResult {

    const status = fixture.fixture.status.short;
    // Basic check: Game must be finished
    if (!['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status)) {
        // console.log(`[ResultChecker] Fixture ${fixture.fixture.id} status is '${status}' (Not Final). Returning PENDING.`);
        return "PENDING";
    }

    // FALLBACK LOGIC: If marketCode is unknown/missing, derive it
    if ((!marketCode || marketCode === "UNKNOWN") && marketName) {
        marketCode = getMarketCode(marketName);
        console.log(`[ResultChecker] Derived marketCode '${marketCode}' from name '${marketName}'`);
    }

    // FALLBACK LOGIC: If selectionCode is missing/unknown, derive it
    if ((!selectionCode || selectionCode === "" || selectionCode === "UNKNOWN") && selectionName) {
        selectionCode = getSelectionCode(selectionName);
        console.log(`[ResultChecker] Derived selectionCode '${selectionCode}' from name '${selectionName}'`);
    }

    // Normalize codes to be case-insensitive
    marketCode = marketCode.toUpperCase();
    selectionCode = selectionCode.toUpperCase();

    // FALLBACK LOGIC: If line is missing, try to parse it from selectionName
    // e.g. "Over 0.5", "Under 2.5 Goals"
    if ((line === null || line === undefined) && selectionName) {
        const match = selectionName.match(/(\d+(\.\d+)?)/);
        if (match) {
            line = parseFloat(match[0]);
            console.log(`[ResultChecker] Derived line '${line}' from selectionName '${selectionName}'`);
        }
    }

    const s = getScores(fixture);

    switch (marketCode) {
        // --- MATCH WINNER & RELATED ---
        case "MATCH_WINNER": // 1X2
            if (selectionCode === "HOME") return s.ft.home > s.ft.away ? "WON" : "LOST";
            if (selectionCode === "DRAW") return s.ft.home === s.ft.away ? "WON" : "LOST";
            if (selectionCode === "AWAY") return s.ft.home < s.ft.away ? "WON" : "LOST";
            break;

        case "HOME_AWAY": // Draw No Bet (DNB)
        case "DRAW_NO_BET":
            if (s.ft.home === s.ft.away) return "VOID";
            if (selectionCode === "HOME") return s.ft.home > s.ft.away ? "WON" : "LOST";
            if (selectionCode === "AWAY") return s.ft.home < s.ft.away ? "WON" : "LOST";
            break;

        case "DOUBLE_CHANCE":
            if (selectionCode === "1X") return s.ft.home >= s.ft.away ? "WON" : "LOST";
            if (selectionCode === "X2") return s.ft.home <= s.ft.away ? "WON" : "LOST";
            if (selectionCode === "12") return s.ft.home !== s.ft.away ? "WON" : "LOST";
            break;

        // --- HALF TIME MARKETS ---
        case "FIRST_HALF_WINNER":
            if (selectionCode === "HOME") return s.ht.home > s.ht.away ? "WON" : "LOST";
            if (selectionCode === "DRAW") return s.ht.home === s.ht.away ? "WON" : "LOST";
            if (selectionCode === "AWAY") return s.ht.home < s.ht.away ? "WON" : "LOST";
            break;

        case "SECOND_HALF_WINNER":
            if (selectionCode === "HOME") return s.secondHalf.home > s.secondHalf.away ? "WON" : "LOST";
            if (selectionCode === "DRAW") return s.secondHalf.home === s.secondHalf.away ? "WON" : "LOST";
            if (selectionCode === "AWAY") return s.secondHalf.home < s.secondHalf.away ? "WON" : "LOST";
            break;

        case "FIRST_HALF_GOALS":
            // Usually Over/Under for 1st Half
            // We expect selectionCode "OVER" or "UNDER" and a line
            if (line !== null && line !== undefined) {
                const total1H = s.ht.home + s.ht.away;
                if (selectionCode === "OVER") return total1H > line ? "WON" : "LOST";
                if (selectionCode === "UNDER") return total1H < line ? "WON" : "LOST";
            }
            break;

        case "SECOND_HALF_GOALS":
            if (line !== null && line !== undefined) {
                const total2H = s.secondHalf.home + s.secondHalf.away;
                if (selectionCode === "OVER") return total2H > line ? "WON" : "LOST";
                if (selectionCode === "UNDER") return total2H < line ? "WON" : "LOST";
            }
            break;

        case "HT_FT_DOUBLE": // Half-Time/Full-Time
        case "HALF_TIME_FULL_TIME":
            // Format example: "Home/Draw" or "1/X"
            const [htRaw, ftRaw] = selectionCode.split("/");
            if (htRaw && ftRaw) {
                // Helper to map "Home"/"Draw"/"Away" to "HOME"/"DRAW"/"AWAY"
                const mapRes = (str: string) => {
                    const u = str.toUpperCase();
                    if (u.includes("HOME") || u === "1") return "HOME";
                    if (u.includes("AWAY") || u === "2") return "AWAY";
                    if (u.includes("DRAW") || u === "X") return "DRAW";
                    return "UNKNOWN";
                };

                const htBet = mapRes(htRaw);
                const ftBet = mapRes(ftRaw);

                let htRes = s.ht.home > s.ht.away ? "HOME" : (s.ht.home < s.ht.away ? "AWAY" : "DRAW");
                let ftRes = s.ft.home > s.ft.away ? "HOME" : (s.ft.home < s.ft.away ? "AWAY" : "DRAW");

                return (htBet === htRes && ftBet === ftRes) ? "WON" : "LOST";
            }
            break;

        case "WIN_BOTH_HALVES":
            // Team must win 1st half AND win 2nd half separately
            if (selectionCode === "HOME") {
                return (s.ht.home > s.ht.away && s.secondHalf.home > s.secondHalf.away) ? "WON" : "LOST";
            }
            if (selectionCode === "AWAY") {
                return (s.ht.home < s.ht.away && s.secondHalf.home < s.secondHalf.away) ? "WON" : "LOST";
            }
            break;

        case "HIGHEST_SCORING_HALF":
            const goals1 = s.ht.home + s.ht.away;
            const goals2 = s.secondHalf.home + s.secondHalf.away;
            const selUpper = selectionCode.toUpperCase();

            if (selUpper === "1ST_HALF" || selUpper === "1ST HALF" || selUpper === "FIRST HALF") return goals1 > goals2 ? "WON" : "LOST";
            if (selUpper === "2ND_HALF" || selUpper === "2ND HALF" || selUpper === "SECOND HALF") return goals2 > goals1 ? "WON" : "LOST";
            if (selUpper === "EQUAL" || selUpper === "DRAW") return goals1 === goals2 ? "WON" : "LOST";
            break;

        case "MATCH_GOALS_ODD_EVEN":
            const totalGoals = s.ft.home + s.ft.away;
            const isOdd = totalGoals % 2 !== 0;
            const selOddEven = selectionCode.toUpperCase();
            if (selOddEven === "ODD") return isOdd ? "WON" : "LOST";
            if (selOddEven === "EVEN") return !isOdd ? "WON" : "LOST";
            break;

        // --- GOALS MARKETS ---
        case "TOTAL_GOALS": // Match Over/Under
            if (line !== null && line !== undefined) {
                const total = s.ft.home + s.ft.away;
                if (selectionCode === "OVER") return total > line ? "WON" : "LOST";
                if (selectionCode === "UNDER") return total < line ? "WON" : "LOST";
            }
            break;

        case "HOME_TEAM_TOTAL":
            if (line !== null && line !== undefined) {
                if (selectionCode === "OVER") return s.ft.home > line ? "WON" : "LOST";
                if (selectionCode === "UNDER") return s.ft.home < line ? "WON" : "LOST";
            }
            break;

        case "AWAY_TEAM_TOTAL":
            if (line !== null && line !== undefined) {
                if (selectionCode === "OVER") return s.ft.away > line ? "WON" : "LOST";
                if (selectionCode === "UNDER") return s.ft.away < line ? "WON" : "LOST";
            }
            break;

        case "BTTS": // Both Teams To Score
            if (selectionCode === "YES") return (s.ft.home > 0 && s.ft.away > 0) ? "WON" : "LOST";
            if (selectionCode === "NO") return (s.ft.home === 0 || s.ft.away === 0) ? "WON" : "LOST";
            break;

        case "BTTS_FIRST_HALF":
            if (selectionCode === "YES") return (s.ht.home > 0 && s.ht.away > 0) ? "WON" : "LOST";
            if (selectionCode === "NO") return (s.ht.home === 0 || s.ht.away === 0) ? "WON" : "LOST";
            break;

        case "BTTS_SECOND_HALF":
            if (selectionCode === "YES") return (s.secondHalf.home > 0 && s.secondHalf.away > 0) ? "WON" : "LOST";
            if (selectionCode === "NO") return (s.secondHalf.home === 0 || s.secondHalf.away === 0) ? "WON" : "LOST";
            break;

        case "WIN_TO_NIL_HOME":
            // Home wins AND Away scores 0
            if (selectionCode === "YES") return (s.ft.home > s.ft.away && s.ft.away === 0) ? "WON" : "LOST";
            if (selectionCode === "NO") return !(s.ft.home > s.ft.away && s.ft.away === 0) ? "WON" : "LOST";
            break;

        case "WIN_TO_NIL_AWAY":
            // Away wins AND Home scores 0
            if (selectionCode === "YES") return (s.ft.home < s.ft.away && s.ft.home === 0) ? "WON" : "LOST";
            if (selectionCode === "NO") return !(s.ft.home < s.ft.away && s.ft.home === 0) ? "WON" : "LOST";
            break;

        case "CLEAN_SHEET_HOME":
            if (selectionCode === "YES") return s.ft.away === 0 ? "WON" : "LOST";
            if (selectionCode === "NO") return s.ft.away > 0 ? "WON" : "LOST";
            break;

        case "CLEAN_SHEET_AWAY":
            if (selectionCode === "YES") return s.ft.home === 0 ? "WON" : "LOST";
            if (selectionCode === "NO") return s.ft.home > 0 ? "WON" : "LOST";
            break;

        // --- SCORE MARKETS ---
        case "EXACT_SCORE": // Correct Score
            // selectionCode might be "1:0", "2:1" or "1-0".
            // Normalize separators to '-'
            const normSelection = selectionCode.replace(":", "-");
            const actualScore = `${s.ft.home}-${s.ft.away}`;
            return normSelection === actualScore ? "WON" : "LOST";

        case "CORRECT_SCORE_FIRST_HALF":
            const actualScoreHT = `${s.ht.home}-${s.ht.away}`;
            return selectionCode === actualScoreHT ? "WON" : "LOST";

        case "CORRECT_SCORE_SECOND_HALF":
            // NOTE: APIs often treat this as "Score in 2nd half alone" NOT "Running score at FT"
            const actualScore2H = `${s.secondHalf.home}-${s.secondHalf.away}`;
            return selectionCode === actualScore2H ? "WON" : "LOST";

        // --- HANDICAPS ---
        case "ASIAN_HANDICAP":
        case "EUROPEAN_HANDICAP": // Handled similarly roughly, EH has Draw option usually
            // selectionCode: "HOME", "AWAY"
            // line: -1.5, +0.5 etc.

            let effectiveLine = line;
            let effectiveSelection = selectionCode;

            // If line is null, try to parse from selectionCode e.g. "HOME -1"
            if (effectiveLine === null || effectiveLine === undefined) {
                const parts = selectionCode.split(" ");
                if (parts.length > 1) {
                    // Try to parse last part as number
                    const potentialLine = parseFloat(parts[parts.length - 1]);
                    if (!isNaN(potentialLine)) {
                        effectiveLine = potentialLine;
                        // Remove the line from selection to get "HOME" / "AWAY"
                        // BEWARE: "HOME +1" -> parts=["HOME", "+1"]. 
                        // We just want the base selection to compare with our logic
                        // Our logic expects "HOME", "AWAY"
                        // So we take the first part? Or everything except last?
                        // Usually "HOME -1" -> "HOME"
                        effectiveSelection = parts.slice(0, -1).join(" ").trim();
                    }
                }
            }

            if (effectiveLine !== null && effectiveLine !== undefined) {
                // Determine which team received the handicap from the line or selection
                // Usually line is relative to Home. e.g. -1.5 means Home starts with -1.5
                // User provided line usually strictly numeric relative to selection? 
                // Or simplified: Home Handicap -1.5

                // Let's assume 'line' is always added to the selected team's score.
                let adjustedHome = s.ft.home;
                let adjustedAway = s.ft.away;

                // Normalize effectiveSelection
                if (effectiveSelection === "HOME") effectiveSelection = "HOME"; // Already upper from start

                // if (selectionCode === "HOME") ... 
                // We need to use effectiveSelection now

                // Logic: Line is added to the SELECTED team.
                // If I bet "HOME -1", I need (Home Score - 1) > Away Score

                let selectedScore = s.ft.home;
                let otherScore = s.ft.away;

                if (effectiveSelection === "HOME") {
                    selectedScore = s.ft.home;
                    otherScore = s.ft.away;
                } else if (effectiveSelection === "AWAY") {
                    selectedScore = s.ft.away;
                    otherScore = s.ft.home;
                } else if (effectiveSelection === "DRAW" && marketCode === "EUROPEAN_HANDICAP") {
                    // Handled in EH block below
                    selectedScore = 0;
                    otherScore = 0;
                } else {
                    return "PENDING";
                }

                // Effective score comparison
                // Check for Draw (EH)
                if (marketCode === "EUROPEAN_HANDICAP") {
                    // EH Rules: 3-Way Market. No Voids.
                    // Home (-1): (Home - 1) > Away
                    // Draw (-1): (Home - 1) == Away
                    // Away (+1): (Away + 1) > Home [Note: usually expressed as local line]

                    // If selection is DRAW, standard convention is Home-based Line?
                    // E.g. "Draw (-1)" usually matches "Home (-1)" handicap.
                    // Let's assume the line is always relative to Home for DRAW picks.
                    if (effectiveSelection === "DRAW") {
                        const scoreA = s.ft.home;
                        const scoreB = s.ft.away;
                        // Determine if Match?
                        // Using epsilon for safety with floats (though scores usually ints)
                        if (Math.abs((scoreA + effectiveLine) - scoreB) < 0.1) return "WON";
                        return "LOST";
                    }

                    // For HOME/AWAY, we use the selected score + line > other score
                    if (selectedScore + effectiveLine > otherScore) return "WON";

                    // If equal or less, it's LOST (because Draw option exists)
                    return "LOST";
                }

                // Asian Handicap (Void on draw)
                if (selectedScore + effectiveLine > otherScore) return "WON";
                if (selectedScore + effectiveLine < otherScore) return "LOST";
                return "VOID"; // Push
            }
            break;

        // --- FIRST/LAST SCORER (TEAM) ---
        case "TEAM_TO_SCORE_FIRST":
            // Requires events parsing
            // Check 'events' array in fixture
            return checkTeamGoalOrder(fixture, selectionCode, "FIRST");
        case "TEAM_TO_SCORE_LAST":
            return checkTeamGoalOrder(fixture, selectionCode, "LAST");
    }

    // Default fallback if market not recognized or no logic matched
    console.log(`[ResultChecker] Unhandled Market/Selection: ${marketCode} / ${selectionCode} (Line: ${line}) for Fixture ${fixture.fixture.id}`);

    // Debugging: If game is finished but we are returning PENDING, it's weird.
    if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status)) {
        console.warn(`[ResultChecker] WARNING: Returning PENDING for finished game ${fixture.fixture.id} (${status})!`);
        console.warn(`Details: Market="${marketName}" Code="${marketCode}" | Selection="${selectionName}" Code="${selectionCode}" | Line="${line}"`);
        console.warn(`Scores: FT=${s.ft.home}-${s.ft.away} | HT=${s.ht.home}-${s.ht.away}`);
    }

    return "PENDING";
}

function checkTeamGoalOrder(fixture: ApiFixtureResponse, selectionCode: string, mode: "FIRST" | "LAST"): BetItemResult {
    // events: { time: { elapsed }, team: { id }, type: "Goal" }
    // Sort events by time
    // We need real team IDs to match "HOME"/"AWAY"
    // fixture.teams.home.id

    // cast validation
    if (!fixture.events || fixture.events.length === 0) {
        return selectionCode === "NO_GOAL" ? "WON" : "LOST";
        // Logic: if 0-0, "No Goal" wins, specific team loses.
    }

    // Filter goals only
    const goals = fixture.events.filter(e => e.type === "Goal" && e.detail !== "Missed Penalty");

    if (goals.length === 0) {
        return selectionCode === "NO_GOAL" ? "WON" : "LOST";
    }

    // Sort by time
    // Note: API events usually sorted, but let's be safe
    goals.sort((a, b) => {
        const tA = (a.time.elapsed || 0) + (a.time.extra || 0);
        const tB = (b.time.elapsed || 0) + (b.time.extra || 0);
        return tA - tB;
    });

    const targetGoal = mode === "FIRST" ? goals[0] : goals[goals.length - 1];

    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;
    const goalTeamId = targetGoal.team.id;

    let scoringTeam = "";
    if (goalTeamId === homeId) scoringTeam = "HOME";
    else if (goalTeamId === awayId) scoringTeam = "AWAY";

    // 1. Direct Match (HOME/AWAY)
    if (selectionCode === scoringTeam) return "WON";

    // 2. Name Match (e.g. Selection "AC Milan" vs Team Name "AC Milan")
    // Retrieve Name for the scoring team
    let specificTeamName = "";
    if (scoringTeam === "HOME") specificTeamName = fixture.teams.home.name;
    if (scoringTeam === "AWAY") specificTeamName = fixture.teams.away.name;

    if (specificTeamName && selectionCode.toUpperCase() === specificTeamName.toUpperCase()) {
        return "WON";
    }

    // 3. Check for loss conditions
    // If scoringTeam found but doesn't match selection, and selection isn't the OTHER team?
    // Actually, if we found a goal, and it wasn't the selected one, it's LOST (unless checking First Goal and this is the second goal, but we pre-filtered targetGoal).
    return "LOST";
}
