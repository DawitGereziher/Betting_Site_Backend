"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkItemResult = checkItemResult;
// Helper to normalize score lines
function getScores(fixture) {
    var _a, _b, _c, _d;
    const { score } = fixture;
    // STRICT 90-MINUTE RULE: Use score.fulltime ONLY.
    // Ensure we handle nulls (default to 0).
    // If status is FT, AET, or PEN, 'score.fulltime' should contain the 90-min result.
    const ftHome = (_a = score.fulltime.home) !== null && _a !== void 0 ? _a : 0;
    const ftAway = (_b = score.fulltime.away) !== null && _b !== void 0 ? _b : 0;
    const htHome = (_c = score.halftime.home) !== null && _c !== void 0 ? _c : 0;
    const htAway = (_d = score.halftime.away) !== null && _d !== void 0 ? _d : 0;
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
// Logic for each market
function checkItemResult(marketCode, selectionCode, // e.g. "HOME", "OVER", "1-0"
line, // e.g. 2.5, -1.0
fixture, oddValue) {
    const status = fixture.fixture.status.short;
    // Basic check: Game must be finished
    // We accept AET/PEN statuses but only use 90-min score
    // Added AWD (Awarded), WO (Walkover)
    if (!['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status)) {
        console.log(`[ResultChecker] Fixture ${fixture.fixture.id} status is '${status}' (Not Final). Returning PENDING.`);
        return "PENDING";
    }
    // Normalize codes to be case-insensitive
    marketCode = marketCode.toUpperCase();
    selectionCode = selectionCode.toUpperCase();
    const s = getScores(fixture);
    switch (marketCode) {
        // --- MATCH WINNER & RELATED ---
        case "MATCH_WINNER": // 1X2
            if (selectionCode === "HOME")
                return s.ft.home > s.ft.away ? "WON" : "LOST";
            if (selectionCode === "DRAW")
                return s.ft.home === s.ft.away ? "WON" : "LOST";
            if (selectionCode === "AWAY")
                return s.ft.home < s.ft.away ? "WON" : "LOST";
            break;
        case "HOME_AWAY": // Draw No Bet (DNB)
            if (s.ft.home === s.ft.away)
                return "VOID";
            if (selectionCode === "HOME")
                return s.ft.home > s.ft.away ? "WON" : "LOST";
            if (selectionCode === "AWAY")
                return s.ft.home < s.ft.away ? "WON" : "LOST";
            break;
        case "DOUBLE_CHANCE":
            if (selectionCode === "1X")
                return s.ft.home >= s.ft.away ? "WON" : "LOST";
            if (selectionCode === "X2")
                return s.ft.home <= s.ft.away ? "WON" : "LOST";
            if (selectionCode === "12")
                return s.ft.home !== s.ft.away ? "WON" : "LOST";
            break;
        // --- HALF TIME MARKETS ---
        case "FIRST_HALF_WINNER":
            if (selectionCode === "HOME")
                return s.ht.home > s.ht.away ? "WON" : "LOST";
            if (selectionCode === "DRAW")
                return s.ht.home === s.ht.away ? "WON" : "LOST";
            if (selectionCode === "AWAY")
                return s.ht.home < s.ht.away ? "WON" : "LOST";
            break;
        case "SECOND_HALF_WINNER":
            if (selectionCode === "HOME")
                return s.secondHalf.home > s.secondHalf.away ? "WON" : "LOST";
            if (selectionCode === "DRAW")
                return s.secondHalf.home === s.secondHalf.away ? "WON" : "LOST";
            if (selectionCode === "AWAY")
                return s.secondHalf.home < s.secondHalf.away ? "WON" : "LOST";
            break;
        case "FIRST_HALF_GOALS":
            // Usually Over/Under for 1st Half
            // We expect selectionCode "OVER" or "UNDER" and a line
            if (line !== null && line !== undefined) {
                const total1H = s.ht.home + s.ht.away;
                if (selectionCode === "OVER")
                    return total1H > line ? "WON" : "LOST";
                if (selectionCode === "UNDER")
                    return total1H < line ? "WON" : "LOST";
            }
            break;
        case "SECOND_HALF_GOALS":
            if (line !== null && line !== undefined) {
                const total2H = s.secondHalf.home + s.secondHalf.away;
                if (selectionCode === "OVER")
                    return total2H > line ? "WON" : "LOST";
                if (selectionCode === "UNDER")
                    return total2H < line ? "WON" : "LOST";
            }
            break;
        case "HT_FT_DOUBLE": // Half-Time/Full-Time
            // Format example: "Home/Draw" or "1/X"
            const [htRaw, ftRaw] = selectionCode.split("/");
            if (htRaw && ftRaw) {
                // Helper to map "Home"/"Draw"/"Away" to "HOME"/"DRAW"/"AWAY"
                const mapRes = (str) => {
                    const u = str.toUpperCase();
                    if (u.includes("HOME") || u === "1")
                        return "HOME";
                    if (u.includes("AWAY") || u === "2")
                        return "AWAY";
                    if (u.includes("DRAW") || u === "X")
                        return "DRAW";
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
            if (selUpper === "1ST_HALF" || selUpper === "1ST HALF" || selUpper === "FIRST HALF")
                return goals1 > goals2 ? "WON" : "LOST";
            if (selUpper === "2ND_HALF" || selUpper === "2ND HALF" || selUpper === "SECOND HALF")
                return goals2 > goals1 ? "WON" : "LOST";
            if (selUpper === "EQUAL" || selUpper === "DRAW")
                return goals1 === goals2 ? "WON" : "LOST";
            break;
        case "MATCH_GOALS_ODD_EVEN":
            const totalGoals = s.ft.home + s.ft.away;
            const isOdd = totalGoals % 2 !== 0;
            const selOddEven = selectionCode.toUpperCase();
            if (selOddEven === "ODD")
                return isOdd ? "WON" : "LOST";
            if (selOddEven === "EVEN")
                return !isOdd ? "WON" : "LOST";
            break;
        // --- GOALS MARKETS ---
        case "TOTAL_GOALS": // Match Over/Under
            if (line !== null && line !== undefined) {
                const total = s.ft.home + s.ft.away;
                if (selectionCode === "OVER")
                    return total > line ? "WON" : "LOST";
                if (selectionCode === "UNDER")
                    return total < line ? "WON" : "LOST";
            }
            break;
        case "HOME_TEAM_TOTAL":
            if (line !== null && line !== undefined) {
                if (selectionCode === "OVER")
                    return s.ft.home > line ? "WON" : "LOST";
                if (selectionCode === "UNDER")
                    return s.ft.home < line ? "WON" : "LOST";
            }
            break;
        case "AWAY_TEAM_TOTAL":
            if (line !== null && line !== undefined) {
                if (selectionCode === "OVER")
                    return s.ft.away > line ? "WON" : "LOST";
                if (selectionCode === "UNDER")
                    return s.ft.away < line ? "WON" : "LOST";
            }
            break;
        case "BTTS": // Both Teams To Score
            if (selectionCode === "YES")
                return (s.ft.home > 0 && s.ft.away > 0) ? "WON" : "LOST";
            if (selectionCode === "NO")
                return (s.ft.home === 0 || s.ft.away === 0) ? "WON" : "LOST";
            break;
        case "WIN_TO_NIL_HOME":
            // Home wins AND Away scores 0
            if (selectionCode === "YES")
                return (s.ft.home > s.ft.away && s.ft.away === 0) ? "WON" : "LOST";
            if (selectionCode === "NO")
                return !(s.ft.home > s.ft.away && s.ft.away === 0) ? "WON" : "LOST";
            break;
        case "WIN_TO_NIL_AWAY":
            // Away wins AND Home scores 0
            if (selectionCode === "YES")
                return (s.ft.home < s.ft.away && s.ft.home === 0) ? "WON" : "LOST";
            if (selectionCode === "NO")
                return !(s.ft.home < s.ft.away && s.ft.home === 0) ? "WON" : "LOST";
            break;
        case "CLEAN_SHEET_HOME":
            if (selectionCode === "YES")
                return s.ft.away === 0 ? "WON" : "LOST";
            if (selectionCode === "NO")
                return s.ft.away > 0 ? "WON" : "LOST";
            break;
        case "CLEAN_SHEET_AWAY":
            if (selectionCode === "YES")
                return s.ft.home === 0 ? "WON" : "LOST";
            if (selectionCode === "NO")
                return s.ft.home > 0 ? "WON" : "LOST";
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
                if (effectiveSelection === "HOME")
                    effectiveSelection = "HOME"; // Already upper from start
                // if (selectionCode === "HOME") ... 
                // We need to use effectiveSelection now
                // Logic: Line is added to the SELECTED team.
                // If I bet "HOME -1", I need (Home Score - 1) > Away Score
                let selectedScore = s.ft.home;
                let otherScore = s.ft.away;
                if (effectiveSelection === "HOME") {
                    selectedScore = s.ft.home;
                    otherScore = s.ft.away;
                }
                else if (effectiveSelection === "AWAY") {
                    selectedScore = s.ft.away;
                    otherScore = s.ft.home;
                }
                else {
                    return "PENDING"; // DRAW? 
                }
                // Effective score comparison
                // Check for Draw (EH)
                if (marketCode === "EUROPEAN_HANDICAP") {
                    // EH has 3 options: Home(-1), Draw(-1), Away(+1)??
                    // Actually usually "Draw (-1)" means Home -1Result == Away Result
                    // But wait, if selection is "DRAW", we need to handle that.
                    // "DRAW -1" -> Home starts with -1, match ends in draw?
                    // Or "Handicap Draw -1" usually means Home wins by exactly 1 goal.
                    // If the user selection was "HOME -1", effectiveSelection="HOME", line=-1.
                    // If user selection was "DRAW (0-1)", effectiveSelection="DRAW"?
                    // Let's stick to the simple logic: Line added to SELECTION.
                    const resScore = selectedScore + effectiveLine;
                    if (resScore > otherScore)
                        return "WON";
                    if (resScore < otherScore)
                        return "LOST";
                    // Valid for Asian? Void. For European? Lost (since Draw exists)
                    // If market is EH and result is equal, and we picked Home/Away, we LOST.
                    // Only if we picked DRAW we might win.
                    // BUT we don't know if "DRAW" is a valid selection logic here yet. 
                    // Let's assume simple 2-way for now or standard > <.
                    // If equal:
                    return "LOST";
                }
                // Asian Handicap (Void on draw)
                if (selectedScore + effectiveLine > otherScore)
                    return "WON";
                if (selectedScore + effectiveLine < otherScore)
                    return "LOST";
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
    return "PENDING";
}
function checkTeamGoalOrder(fixture, selectionCode, mode) {
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
    if (goalTeamId === homeId)
        scoringTeam = "HOME";
    else if (goalTeamId === awayId)
        scoringTeam = "AWAY";
    return selectionCode === scoringTeam ? "WON" : "LOST";
}
