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
exports.apiFootballGet = apiFootballGet;
const cache_1 = require("./cache");
const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;
if (!API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("API_FOOTBALL_KEY is not set. API-FOOTBALL integration will not work.");
}
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute
function apiFootballGet(path_1, params_1) {
    return __awaiter(this, arguments, void 0, function* (path, params, ttlMs = DEFAULT_TTL_MS, forceRefresh = false) {
        var _a, _b;
        const query = (_a = params === null || params === void 0 ? void 0 : params.toString()) !== null && _a !== void 0 ? _a : "";
        const cacheKey = `api-football:${path}:${query}`;
        if (!forceRefresh) {
            const cached = (0, cache_1.getFromCache)(cacheKey);
            if (cached) {
                console.log(`[API-FOOTBALL] Cache HIT for ${path}?${query}`);
                return cached;
            }
            console.log(`[API-FOOTBALL] Cache MISS for ${path}?${query}`);
        }
        else {
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
                const res = yield fetch(url, {
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
                const json = yield res.json();
                console.log(`[API-FOOTBALL] SUCCESS for ${path}?${query} - Response has ${((_b = json.response) === null || _b === void 0 ? void 0 : _b.length) || 0} items`);
                (0, cache_1.setInCache)(cacheKey, json, ttlMs);
                return json;
            }
            catch (err) {
                attempts++;
                console.warn(`API-FOOTBALL request failed (Attempt ${attempts}/${maxAttempts}): ${url}`, err.message);
                if (attempts >= maxAttempts) {
                    throw err;
                }
                // Wait 1s before retry
                yield new Promise(r => setTimeout(r, 1000));
            }
        }
    });
}
// NOTE: Implement full normalization mapping from API-FOOTBALL odds structure
// into our internal NormalizedFixtureOdds format here. For demo purposes this
// is left as a thin wrapper that can be extended to support all markets
