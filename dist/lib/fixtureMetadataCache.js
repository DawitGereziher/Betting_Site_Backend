"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixtureMetadata = getFixtureMetadata;
exports.storeFixtureMetadata = storeFixtureMetadata;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FIXTURE_CACHE_FILE = path_1.default.join(__dirname, '../../fixture_metadata_cache.json');
let fixtureCache = new Map();
// Load cache from disk on startup
function loadCache() {
    try {
        if (fs_1.default.existsSync(FIXTURE_CACHE_FILE)) {
            const data = fs_1.default.readFileSync(FIXTURE_CACHE_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            fixtureCache = new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v]));
            console.log(`[FixtureCache] Loaded ${fixtureCache.size} fixtures from disk`);
        }
    }
    catch (e) {
        console.error('[FixtureCache] Failed to load cache:', e);
    }
}
// Save cache to disk
function saveCache() {
    try {
        const obj = Object.fromEntries(fixtureCache.entries());
        fs_1.default.writeFileSync(FIXTURE_CACHE_FILE, JSON.stringify(obj, null, 2));
    }
    catch (e) {
        console.error('[FixtureCache] Failed to save cache:', e);
    }
}
// Get fixture metadata
function getFixtureMetadata(fixtureId) {
    return fixtureCache.get(fixtureId) || null;
}
// Store fixture metadata (call this whenever we fetch fixture data from API)
function storeFixtureMetadata(fixture) {
    var _a;
    if (!fixture || !fixture.fixture || !fixture.teams)
        return;
    const metadata = {
        id: fixture.fixture.id,
        home: fixture.teams.home.name,
        away: fixture.teams.away.name,
        league: ((_a = fixture.league) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
        date: fixture.fixture.date
    };
    fixtureCache.set(metadata.id, metadata);
    // Save to disk every 10 new entries
    if (fixtureCache.size % 10 === 0) {
        saveCache();
    }
}
// Initialize on module load
loadCache();
// Save on process exit
process.on('exit', () => {
    saveCache();
});
process.on('SIGINT', () => {
    saveCache();
    process.exit();
});
