"use strict";
/**
 * Debug script to test fixture fetching
 * Run with: npx tsx debug_fixture_fetch.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function testFixtureFetch() {
    return __awaiter(this, void 0, void 0, function* () {
        const fixtureId = 1378035; // The Cagliari vs AC Milan game
        const baseUrl = "http://localhost:3001";
        console.log("\n=== Testing GET /api/bet/ticket ===\n");
        try {
            // First, we need a real ticket reference
            // Let's just call the endpoint with a sample reference
            const testReference = "BET12345"; // Replace with actual reference
            const response = yield fetch(`${baseUrl}/api/bet/ticket?reference=${testReference}`);
            const data = yield response.json();
            console.log("Response status:", response.status);
            console.log("Response data:", JSON.stringify(data, null, 2));
            if (data.items) {
                console.log("\n=== Checking fixtureDetails ===");
                data.items.forEach((item, idx) => {
                    console.log(`Item ${idx + 1}:`);
                    console.log(`  Fixture ID: ${item.fixtureId}`);
                    console.log(`  fixtureDetails:`, item.fixtureDetails);
                    if (item.fixtureDetails) {
                        console.log(`  ✅ Names: ${item.fixtureDetails.home} vs ${item.fixtureDetails.away}`);
                    }
                    else {
                        console.log(`  ❌ NULL - Will show "Fixture ${item.fixtureId}"`);
                    }
                });
            }
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
testFixtureFetch();
