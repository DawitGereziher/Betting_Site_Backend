const { getFromCache, setInCache } = require("./cache");

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
        "API_FOOTBALL_KEY is not set. API-FOOTBALL integration will not work.",
    );
}

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

async function apiFootballGet(
    path,
    params,
    ttlMs = DEFAULT_TTL_MS,
    forceRefresh = false
) {
    const query = params?.toString() ?? "";
    const cacheKey = `api-football:${path}:${query}`;

    if (!forceRefresh) {
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log(`[API-FOOTBALL] Cache HIT for ${path}?${query}`);
            return cached;
        }
        console.log(`[API-FOOTBALL] Cache MISS for ${path}?${query}`);
    } else {
        console.log(`[API-FOOTBALL] Force refresh (skipping cache) for ${path}?${query}`);
    }

    if (!API_KEY) {
        throw new Error("API-FOOTBALL key not configured");
    }

    const url = `${API_BASE}${path}${query ? `?${query}` : ""}`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const headers = {
                "x-apisports-key": API_KEY,
            };

            if (forceRefresh) {
                headers["Cache-Control"] = "no-cache";
                headers["Pragma"] = "no-cache";
            }

            const res = await fetch(url, {
                method: "GET",
                headers,
                // server-side only
                cache: "no-store",
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`API-FOOTBALL error: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();
            console.log(`[API-FOOTBALL] SUCCESS for ${path}?${query} - Response has ${json.response?.length || 0} items`);
            setInCache(cacheKey, json, ttlMs);
            return json;

        } catch (err) {
            attempts++;
            console.warn(`API-FOOTBALL request failed (Attempt ${attempts}/${maxAttempts}): ${url}`, err.message);

            if (attempts >= maxAttempts) {
                throw err;
            }

            // Wait 1s before retry
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

module.exports = {
    apiFootballGet
};
