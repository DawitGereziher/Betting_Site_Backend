const cacheStore = new Map();

function getFromCache(key) {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cacheStore.delete(key);
        return null;
    }
    return entry.value;
}

function setInCache(key, value, ttlMs) {
    cacheStore.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    });
}

function clearCacheKey(key) {
    cacheStore.delete(key);
}

// NOTE: For production, replace this module with a Redis-backed cache while
// keeping the same interface (get/set/clear) for server-side caching.

module.exports = {
    getFromCache,
    setInCache,
    clearCacheKey
};
