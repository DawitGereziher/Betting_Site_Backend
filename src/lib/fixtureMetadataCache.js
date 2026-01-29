const fs = require('fs');
const path = require('path');

const FIXTURE_CACHE_FILE = path.join(__dirname, '../../fixture_metadata_cache.json');

let fixtureCache = new Map();

// Load cache from disk on startup
function loadCache() {
    try {
        if (fs.existsSync(FIXTURE_CACHE_FILE)) {
            const data = fs.readFileSync(FIXTURE_CACHE_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            fixtureCache = new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v]));
            console.log(`[FixtureCache] Loaded ${fixtureCache.size} fixtures from disk`);
        }
    } catch (e) {
        console.error('[FixtureCache] Failed to load cache:', e);
    }
}

// Save cache to disk
function saveCache() {
    try {
        const obj = Object.fromEntries(fixtureCache.entries());
        fs.writeFileSync(FIXTURE_CACHE_FILE, JSON.stringify(obj, null, 2));
    } catch (e) {
        console.error('[FixtureCache] Failed to save cache:', e);
    }
}

// Get fixture metadata
function getFixtureMetadata(fixtureId) {
    return fixtureCache.get(fixtureId) || null;
}

// Store fixture metadata (call this whenever we fetch fixture data from API)
function storeFixtureMetadata(fixture) {
    if (!fixture || !fixture.fixture || !fixture.teams) return;

    const metadata = {
        id: fixture.fixture.id,
        home: fixture.teams.home.name,
        away: fixture.teams.away.name,
        league: fixture.league?.name || 'Unknown',
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

module.exports = {
    getFixtureMetadata,
    storeFixtureMetadata
};
