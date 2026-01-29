
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

// Minimal reproduction of getMarketCode from resultChecker.ts
function getMarketCode(apiName: string): string {
    const lower = apiName.toLowerCase();
    if (lower === "match winner" || lower === "match result" || lower === "1x2") return "MATCH_WINNER";
    if (lower === "double chance") return "DOUBLE_CHANCE";
    if (lower.includes("both teams score") || lower === "both teams to score" || lower === "btts") return "BTTS";
    if (lower === "total - home" || lower.includes("home team total")) return "HOME_TEAM_TOTAL";
    if (lower === "total - away" || lower.includes("away team total")) return "AWAY_TEAM_TOTAL";
    if (lower.includes("goals over/under") || lower.includes("total goals")) return "TOTAL_GOALS";
    if (lower === "draw no bet") return "DRAW_NO_BET";
    if (lower.includes("asian handicap")) return "ASIAN_HANDICAP";
    if (lower.includes("handicap") && !lower.includes("asian")) return "EUROPEAN_HANDICAP";
    if (lower === "first half winner") return "FIRST_HALF_WINNER";
    if (lower.includes("first half") && (lower.includes("goals") || lower.includes("over/under"))) return "FIRST_HALF_GOALS";
    if (lower.includes("second half") && (lower.includes("goals") || lower.includes("over/under"))) return "SECOND_HALF_GOALS";
    if (lower === "second half winner") return "SECOND_HALF_WINNER";
    if (lower.includes("ht/ft") || lower.includes("half-time/full-time") || lower.includes("ht/ft double")) return "HALF_TIME_FULL_TIME";
    if (lower.includes("correct score") || lower.includes("exact score")) return "EXACT_SCORE";
    if (lower.includes("odd/even")) return "MATCH_GOALS_ODD_EVEN";
    if (lower.includes("clean sheet") && lower.includes("home")) return "CLEAN_SHEET_HOME";
    if (lower.includes("clean sheet") && lower.includes("away")) return "CLEAN_SHEET_AWAY";
    if (lower.includes("win to nil") && lower.includes("home")) return "WIN_TO_NIL_HOME";
    if (lower.includes("win to nil") && lower.includes("away")) return "WIN_TO_NIL_AWAY";
    if (lower.includes("highest scoring half")) return "HIGHEST_SCORING_HALF";
    if (lower === "team to score first" || lower.includes("first team to score")) return "TEAM_TO_SCORE_FIRST";
    if (lower === "team to score last" || lower.includes("last team to score")) return "TEAM_TO_SCORE_LAST";
    if (lower === "win both halves") return "WIN_BOTH_HALVES";

    return "UNKNOWN";
}

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching distinct markets from DB...");
    const items = await prisma.betItem.findMany({
        select: {
            market: true,
            selection: true,
            result: true
        },
        distinct: ['market'] // We want unique markets mainly, but let's check combinations
    });

    console.log(`Found ${items.length} distinct-ish items.`);

    const analysis = items.map(item => {
        const code = getMarketCode(item.market);
        return {
            originalName: item.market,
            derivedCode: code,
            isUnknown: code === "UNKNOWN",
            sampleSelection: item.selection
        };
    });

    // Write to file
    fs.writeFileSync("market_analysis.json", JSON.stringify(analysis, null, 2));
    console.log("Analysis written to market_analysis.json");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
