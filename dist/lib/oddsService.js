"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixtureOdds = getFixtureOdds;
exports.fetchOddsForDate = fetchOddsForDate;
exports.streamOddsForDate = streamOddsForDate;
const apiFootball_1 = require("./apiFootball");
const cache_1 = require("./cache");
const markets_1 = require("./markets");
// Helper to normalize odd values
function normalizeOdd(value) {
    return parseFloat(value);
}
// Helper to extract line from selection name (e.g. "Over 2.5" -> 2.5)
function extractLine(selectionName, marketName) {
    // Ensure string
    const nameStr = String(selectionName);
    // Common patterns: "Over 2.5", "Under 3.5", "Home -1", "Asian Handicap +0.5"
    // We look for a number (integer or decimal, potentially negative) at the end of the string
    // or specifically associated with typical line markets.
    // 1. If it's a simple Over/Under or Handicap
    if (marketName.includes("Over/Under") || marketName.includes("Handicap") || marketName.includes("Goal")) {
        // Match number at the end: "Over 2.5" -> 2.5
        const match = nameStr.match(/([+-]?\d+(\.\d+)?)$/);
        if (match) {
            return parseFloat(match[0]);
        }
    }
    return null;
}
// Helper to map API-Football odds response to our frontend structure
function mapOddsToFrontend(oddsResponse) {
    var _a;
    if (!oddsResponse || !oddsResponse.bookmakers || oddsResponse.bookmakers.length === 0) {
        return []; // No odds available
    }
    // We try to find bookmaker ID 1 (10bet as requested), otherwise fall back to the first one
    const bookmaker = oddsResponse.bookmakers.find((b) => b.id === 1) || oddsResponse.bookmakers[0];
    const markets = [];
    // Define priority markets to show
    const PRIORITY_MARKETS = [
        "Match Winner",
        "Home/Away",
        "Second Half Winner",
        "Goals Over/Under",
        "Over/Under",
        "Both Teams To Score",
        "Double Chance",
        "Handicap Result", // 3-way handicap
        "Asian Handicap",
        "Correct Score",
        "Half Time/Full Time"
    ];
    for (const bet of bookmaker.bets) {
        // Filter or prioritize markets if needed. For now, we take common ones.
        if (!PRIORITY_MARKETS.includes(bet.name) && !bet.name.includes("Winner") && !bet.name.includes("Goals")) {
            // Optional: Skip obscure markets to reduce payload
            // continue; 
        }
        const marketCode = (0, markets_1.getMarketCode)(bet.name);
        // Generate a composite ID to ensure uniqueness for markets with same ID/Name but different lines
        // e.g. "Total Home" (Over 0.5) vs "Total Home" (Over 1.5)
        const uniqueId = `${bet.id}_${bet.name}_${((_a = bet.values[0]) === null || _a === void 0 ? void 0 : _a.value) || 'Gen'}`.replace(/\s+/g, '_');
        const frontendMarket = {
            id: uniqueId,
            market: bet.name,
            marketCode: marketCode,
            bets: []
        };
        for (const value of bet.values) {
            const { code: selectionCode } = (0, markets_1.getSelectionCode)(value.value, marketCode);
            // Handle "lines" for handicaps/over-under
            let selectionName = value.value;
            // Simple parsing for Over/Under to extract line if needed
            const lineValue = extractLine(selectionName, bet.name);
            const oddValue = normalizeOdd(value.odd);
            frontendMarket.bets.push({
                selection: selectionName,
                selectionCode: selectionCode,
                odd: oddValue,
                line: lineValue // We might parse this later if needed for precise logic
            });
        }
        markets.push(frontendMarket);
    }
    return markets;
}
function getFixtureOdds(fixtureId_1) {
    return __awaiter(this, arguments, void 0, function* (fixtureId, skipCache = false) {
        const cacheKey = `fixture_odds:${fixtureId}`;
        if (!skipCache) {
            const cached = yield (0, cache_1.getFromCache)(cacheKey);
            if (cached)
                return cached;
        }
        try {
            // 1. Fetch Fixture Details (for status/names)
            const fixtureParams = new URLSearchParams();
            fixtureParams.set("id", fixtureId.toString());
            const fixtureRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", fixtureParams, undefined, skipCache);
            if (!fixtureRes.response || fixtureRes.response.length === 0) {
                return null;
            }
            const fixtureData = fixtureRes.response[0];
            // 2. Fetch Odds
            const oddsParams = new URLSearchParams();
            oddsParams.set("fixture", fixtureId.toString());
            oddsParams.set("bookmaker", "1"); // Request 10bet/ID 1 explicitly
            const oddsRes = yield (0, apiFootball_1.apiFootballGet)("/odds", oddsParams, undefined, skipCache);
            let markets = [];
            if (oddsRes.response && oddsRes.response.length > 0) {
                markets = mapOddsToFrontend(oddsRes.response[0]);
            }
            const result = {
                fixture: fixtureData.fixture,
                league: fixtureData.league,
                teams: fixtureData.teams,
                goals: fixtureData.goals,
                score: fixtureData.score, // precise score
                status: fixtureData.fixture.status, // short and long
                markets: markets
            };
            // Cache specifically deep details for short time (e.g. 1 min for live, 5 min for pre-match)
            yield (0, cache_1.setInCache)(cacheKey, result, 60 * 1000);
            return result;
        }
        catch (error) {
            console.error(`Error fetching detailed odds for fixture ${fixtureId}:`, error);
            return null;
        }
    });
}
function fetchOddsForDate(date_1) {
    return __awaiter(this, arguments, void 0, function* (date, timezone = "Africa/Addis_Ababa", forceRefresh = false) {
        var _a;
        const cacheKey = `odds_feed:${date}:${timezone}`;
        if (!forceRefresh) {
            const cached = yield (0, cache_1.getFromCache)(cacheKey);
            if (cached) {
                console.log(`Serving odds for ${date} from cache`);
                return cached;
            }
        }
        console.log(`Fetching freshness for date ${date}...`);
        try {
            // 1. Fetch Fixtures for the date
            const fixturesParams = new URLSearchParams();
            fixturesParams.set("date", date);
            fixturesParams.set("timezone", timezone);
            const fixturesRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", fixturesParams, undefined, forceRefresh);
            if (!fixturesRes.response) {
                throw new Error("Failed to fetch fixtures from API");
            }
            const fixtures = fixturesRes.response;
            const leaguesMap = new Map();
            // 2. We need odds for these fixtures.
            console.log(`Fetching odds for ${date} (this may take time)...`);
            // Recursive / sequential fetch of all odds pages
            let allOdds = [];
            let page = 1;
            let totalPages = 1;
            do {
                const oddsParams = new URLSearchParams();
                oddsParams.set("date", date);
                oddsParams.set("timezone", timezone);
                oddsParams.set("page", page.toString());
                oddsParams.set("bookmaker", "1"); // Request 10bet/ID 1
                const oddsRes = yield (0, apiFootball_1.apiFootballGet)("/odds", oddsParams, undefined, forceRefresh);
                if (oddsRes.response) {
                    allOdds = allOdds.concat(oddsRes.response);
                    totalPages = ((_a = oddsRes.paging) === null || _a === void 0 ? void 0 : _a.total) || 1;
                }
                page++;
            } while (page <= totalPages && page <= 5); // Safety limit 5 pages for now to prevent timeouts
            // Map odds to fixture IDs
            const oddsMap = new Map();
            allOdds.forEach((o) => {
                oddsMap.set(o.fixture.id, o);
            });
            // 3. Merge Fixtures and Odds
            for (const f of fixtures) {
                // STRICT FILTERING:
                // 1. Status must be "Not Started" (NS) or "Time to be Defined" (TBD)
                if (!["NS", "TBD"].includes(f.fixture.status.short)) {
                    continue;
                }
                // 2. Date Validation: Ensure the fixture's local date matches the requested date
                // The API usually handles this, but we double-check to avoid "wrong date" issues
                const fixtureDate = new Date(f.fixture.date);
                const localDateStr = fixtureDate.toLocaleDateString("en-CA", { timeZone: timezone });
                if (localDateStr !== date) {
                    continue;
                }
                // Helper to get or create league
                const leagueId = f.league.id;
                if (!leaguesMap.has(leagueId)) {
                    leaguesMap.set(leagueId, {
                        id: leagueId,
                        name: f.league.name,
                        country: f.league.country,
                        logo: f.league.logo,
                        flag: f.league.flag,
                        fixtures: []
                    });
                }
                const fixtureOdds = oddsMap.get(f.fixture.id);
                const markets = fixtureOdds ? mapOddsToFrontend(fixtureOdds) : [];
                leaguesMap.get(leagueId).fixtures.push({
                    id: f.fixture.id,
                    date: f.fixture.date, // ISO string
                    status: f.fixture.status.short, // NS, FT, LIVE etc
                    homeTeam: f.teams.home.name,
                    awayTeam: f.teams.away.name,
                    homeScore: f.goals.home,
                    awayScore: f.goals.away,
                    markets: markets
                });
            }
            const leagues = Array.from(leaguesMap.values());
            const response = {
                date: date,
                leagues: leagues
            };
            // Cache for 1 minute
            yield (0, cache_1.setInCache)(cacheKey, response, 60 * 1000);
            return response;
        }
        catch (error) {
            console.error("Error in fetchOddsForDate:", error);
            throw error;
        }
    });
}
// STREAMING IMPLEMENTATION
function streamOddsForDate(date_1) {
    return __awaiter(this, arguments, void 0, function* (date, timezone = "Africa/Addis_Ababa", onChunk, forceRefresh = false) {
        var _a;
        // 1. Fetch ALL fixtures first (1 call) - FAST
        const fixturesParams = new URLSearchParams();
        fixturesParams.set("date", date);
        fixturesParams.set("timezone", timezone);
        const fixturesRes = yield (0, apiFootball_1.apiFootballGet)("/fixtures", fixturesParams, undefined, forceRefresh);
        if (!fixturesRes.response) {
            // If fails, we can't do anything
            return;
        }
        const fixtures = fixturesRes.response;
        const leaguesMap = new Map();
        // Sort valid fixtures first
        const ALLOWED_STATUSES = new Set(["TBD", "NS"]);
        // Corrected variable name from fixturesBatch to fixtures
        fixtures.forEach((f) => {
            // Filter by status if needed, but for "pipeline" maybe show all?
            // User requested removing live games:
            if (!ALLOWED_STATUSES.has(f.fixture.status.short)) {
                return;
            }
            // Date Validation
            const fixtureDate = new Date(f.fixture.date);
            const localDateStr = fixtureDate.toLocaleDateString("en-CA", { timeZone: timezone });
            if (localDateStr !== date) {
                return;
            }
            const leagueId = f.league.id;
            if (!leaguesMap.has(leagueId)) {
                leaguesMap.set(leagueId, {
                    id: leagueId,
                    name: f.league.name,
                    country: f.league.country,
                    logo: f.league.logo,
                    flag: f.league.flag,
                    fixtures: []
                });
            }
            leaguesMap.get(leagueId).fixtures.push({
                id: f.fixture.id,
                date: f.fixture.date,
                status: f.fixture.status.short,
                homeTeam: f.teams.home.name,
                awayTeam: f.teams.away.name,
                homeScore: f.goals.home,
                awayScore: f.goals.away,
                markets: [] // EMPTY initially
            });
        });
        const leagues = Array.from(leaguesMap.values());
        // EMIT SKELETON
        onChunk("fixtures", leagues);
        // 2. Iterate pages of Odds
        let page = 1;
        let totalPages = 1;
        // We can fetch pages in parallel or series. Series for now to stream steadily.
        do {
            const oddsParams = new URLSearchParams();
            oddsParams.set("date", date);
            oddsParams.set("timezone", timezone);
            oddsParams.set("page", page.toString());
            // bookmaker=1 (10bet/Bet365 requested ID)
            oddsParams.set("bookmaker", "1");
            const oddsRes = yield (0, apiFootball_1.apiFootballGet)("/odds", oddsParams, undefined, forceRefresh);
            if (oddsRes.response && oddsRes.response.length > 0) {
                const updates = oddsRes.response.map((o) => ({
                    fixtureId: o.fixture.id,
                    markets: mapOddsToFrontend(o)
                }));
                // EMIT CHUNK
                onChunk("odds_update", updates);
            }
            totalPages = ((_a = oddsRes.paging) === null || _a === void 0 ? void 0 : _a.total) || 1;
            page++;
        } while (page <= totalPages && page <= 20); // Cap at 20 pages for safety
    });
}
