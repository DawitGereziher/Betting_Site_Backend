
import { checkItemResult } from "../lib/resultChecker";
import { ApiFixtureResponse } from "../lib/apiFootball";

const mockFixture: ApiFixtureResponse = {
    fixture: {
        id: 1378035,
        referee: "Rosario Abisso, Italy",
        timezone: "UTC",
        date: "2026-01-02T19:45:00+00:00",
        timestamp: 1767383100,
        periods: { first: 1767383100, second: 1767386700 },
        venue: { id: 12275, name: "Unipol Domus", city: "Cagliari" },
        status: { long: "Match Finished", short: "FT", elapsed: 90 }
    },
    league: {
        id: 135, name: "Serie A", country: "Italy", logo: "", flag: "", season: 2025, round: "Regular Season - 18"
    },
    teams: {
        home: { id: 490, name: "Cagliari", logo: "", winner: false },
        away: { id: 489, name: "AC Milan", logo: "", winner: true }
    },
    goals: { home: 0, away: 1 },
    score: {
        halftime: { home: 0, away: 0 },
        fulltime: { home: 0, away: 1 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
    },
    events: [
        {
            time: { elapsed: 50, extra: null },
            team: { id: 489, name: "AC Milan", logo: "" },
            player: { id: 22236, name: "R. Leao" },
            assist: { id: 272, name: "A. Rabiot" },
            type: "Goal",
            detail: "Normal Goal",
            comments: null
        }
    ]
};

const tests = [
    // MATCH WINNER (0-1)
    { market: "MATCH_WINNER", selection: "AWAY", line: null, expected: "WON" },
    { market: "MATCH_WINNER", selection: "HOME", line: null, expected: "LOST" },
    { market: "MATCH_WINNER", selection: "DRAW", line: null, expected: "LOST" },

    // HOME/AWAY (Draw No Bet)
    { market: "HOME_AWAY", selection: "AWAY", line: null, expected: "WON" },

    // DOUBLE CHANCE
    { market: "DOUBLE_CHANCE", selection: "X2", line: null, expected: "WON" }, // Draw or Away
    { market: "DOUBLE_CHANCE", selection: "1X", line: null, expected: "LOST" }, // Home or Draw

    // TOTAL GOALS (1)
    { market: "TOTAL_GOALS", selection: "OVER", line: 0.5, expected: "WON" },
    { market: "TOTAL_GOALS", selection: "UNDER", line: 1.5, expected: "WON" },
    { market: "TOTAL_GOALS", selection: "OVER", line: 1.5, expected: "LOST" },

    // FIRST HALF GOALS (0-0)
    { market: "FIRST_HALF_GOALS", selection: "UNDER", line: 0.5, expected: "WON" },

    // SECOND HALF GOALS (0-1)
    { market: "SECOND_HALF_GOALS", selection: "OVER", line: 0.5, expected: "WON" },

    // HT/FT (Draw/Away)
    { market: "HT_FT_DOUBLE", selection: "DRAW/AWAY", line: null, expected: "WON" },
    { market: "HT_FT_DOUBLE", selection: "DRAW/DRAW", line: null, expected: "LOST" },

    // BTTS (No)
    { market: "BTTS", selection: "NO", line: null, expected: "WON" },
    { market: "BTTS", selection: "YES", line: null, expected: "LOST" },

    // WIN TO NIL
    { market: "WIN_TO_NIL_AWAY", selection: "YES", line: null, expected: "WON" }, // Away won and Home 0
    { market: "WIN_TO_NIL_HOME", selection: "YES", line: null, expected: "LOST" },

    // HIGHEST SCORING HALF (2nd)
    { market: "HIGHEST_SCORING_HALF", selection: "2ND_HALF", line: null, expected: "WON" },
    { market: "HIGHEST_SCORING_HALF", selection: "1ST_HALF", line: null, expected: "LOST" },

    // EXACT SCORE (0-1)
    { market: "EXACT_SCORE", selection: "0-1", line: null, expected: "WON" },
    { market: "EXACT_SCORE", selection: "0-0", line: null, expected: "LOST" },

    // TEAM TO SCORE FIRST (AC Milan / AWAY)
    { market: "TEAM_TO_SCORE_FIRST", selection: "AWAY", line: null, expected: "WON" },
    { market: "TEAM_TO_SCORE_FIRST", selection: "HOME", line: null, expected: "LOST" },

    // HANDICAPS
    // Home +1.5 -> Score becomes 1.5 - 1 -> Home Wins
    { market: "ASIAN_HANDICAP", selection: "HOME", line: 1.5, expected: "WON" },
    // Away -1.5 -> Score becomes 0 - (-0.5) -> Away Loses (0-1 score, handicap -1.5 makes it 0 - -0.5 ?? No.)
    // Wait, simple handicap logic:
    // Selected AWAY. Line -1.5. Adjusted Score: Away Score + (-1.5) = 1 - 1.5 = -0.5.
    // Home Score = 0.
    // -0.5 < 0. So AWAY LOST.
    { market: "ASIAN_HANDICAP", selection: "AWAY", line: -1.5, expected: "LOST" },
];

async function runVerify() {
    const output = [];
    output.push("--- Verifying Result Logic ---");
    let passed = 0;
    for (const t of tests) {
        const result = checkItemResult(t.market, t.selection, t.line, mockFixture, 1.50);
        const success = result === t.expected;
        if (success) passed++;
        output.push(`[${success ? 'PASS' : 'FAIL'}] ${t.market} ${t.selection} (Line: ${t.line}) -> Got: ${result}, Expected: ${t.expected}`);
    }
    output.push(`--- Result: ${passed}/${tests.length} Passed ---`);

    console.log(output.join("\n"));
    const fs = require('fs');
    fs.writeFileSync('results.txt', output.join("\n"), 'utf8');
}

runVerify().catch(console.error);
