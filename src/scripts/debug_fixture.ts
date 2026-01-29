
import { apiFootballGet } from "../lib/apiFootball";
import { checkItemResult } from "../lib/resultChecker";
import { getFixtureMetadata } from "../lib/fixtureMetadataCache";
import "dotenv/config";
import * as fs from "fs";

async function main() {
    const fixtureId = 1451285;

    console.log(`Fetching fixture ${fixtureId}...`);
    const params = new URLSearchParams();
    params.set("id", fixtureId.toString());

    try {
        const res = await apiFootballGet("/fixtures", params, 60000, true);

        if (!res.response || res.response.length === 0) {
            console.error("Fixture not found in API.");
            return;
        }

        const fixture = res.response[0];

        const output = {
            fixtureStatus: fixture.fixture.status,
            score: fixture.score,
            events: (fixture.events || []).slice(0, 3),
            tests: [] as any[]
        };

        // 2. Test Check Logic against this fixture
        console.log("\n--- Testing Check Logic ---");

        const testCases = [
            { market: "Match Winner", selection: "Home", expectation: "Check 1x2 Home" },
            { market: "1x2", selection: "1", expectation: "Check 1" },
            { market: "Total Goals", selection: "Over 2.5", line: 2.5, expectation: "Check Over 2.5" },
            { market: "Correct Score", selection: "2-0", expectation: "Check Correct Score" },
            { market: "Some Weird Market", selection: "Yes", expectation: "Check Unknown" }
        ];

        for (const tc of testCases) {
            const result = checkItemResult(
                "UNKNOWN", // Force derivation
                "UNKNOWN",
                tc.line,
                fixture,
                1.50,
                tc.market,
                tc.selection
            );
            output.tests.push({ ...tc, result });
        }

        fs.writeFileSync("debug_output.json", JSON.stringify(output, null, 2));
        console.log("Wrote output to debug_output.json");

    } catch (e) {
        console.error("Error running debug:", e);
    }
}

main();
