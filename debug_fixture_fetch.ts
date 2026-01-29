/**
 * Debug script to test fixture fetching
 * Run with: npx tsx debug_fixture_fetch.ts
 */

async function testFixtureFetch() {
    const fixtureId = 1378035; // The Cagliari vs AC Milan game
    const baseUrl = "http://localhost:3001";

    console.log("\n=== Testing GET /api/bet/ticket ===\n");

    try {
        // First, we need a real ticket reference
        // Let's just call the endpoint with a sample reference
        const testReference = "BET12345"; // Replace with actual reference

        const response = await fetch(`${baseUrl}/api/bet/ticket?reference=${testReference}`);
        const data = await response.json();

        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(data, null, 2));

        if (data.items) {
            console.log("\n=== Checking fixtureDetails ===");
            data.items.forEach((item: any, idx: number) => {
                console.log(`Item ${idx + 1}:`);
                console.log(`  Fixture ID: ${item.fixtureId}`);
                console.log(`  fixtureDetails:`, item.fixtureDetails);
                if (item.fixtureDetails) {
                    console.log(`  ✅ Names: ${item.fixtureDetails.home} vs ${item.fixtureDetails.away}`);
                } else {
                    console.log(`  ❌ NULL - Will show "Fixture ${item.fixtureId}"`);
                }
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testFixtureFetch();
