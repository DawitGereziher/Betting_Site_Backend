import { getFromCache, setInCache } from "./cache";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "API_FOOTBALL_KEY is not set. API-FOOTBALL integration will not work.",
  );
}

type ApiFootballPath =
  | "/fixtures"
  | "/odds"
  | "/odds/live"
  | "/odds/live/bets"
  | "/fixtures/statistics"
  | "/fixtures/events";

export type OddsMarketType =
  | "MATCH_WINNER"
  | "DOUBLE_CHANCE"
  | "DRAW_NO_BET"
  | "OVER_UNDER"
  | "BTTS"
  | "ASIAN_HANDICAP"
  | "EUROPEAN_HANDICAP"
  | "HALF_TIME_FULL_TIME"
  | "HALF_MARKETS"
  | "CORNERS"
  | "CARDS"
  | "SPECIAL";

export type NormalizedSelection = {
  id: string;
  label: string;
  odds: number;
};

export type NormalizedMarket = {
  type: OddsMarketType;
  key: string;
  name: string;
  selections: NormalizedSelection[];
};

export type NormalizedFixtureOdds = {
  fixtureId: number;
  markets: NormalizedMarket[];
  updatedAt: string;
};

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

export async function apiFootballGet(
  path: ApiFootballPath,
  params?: URLSearchParams,
  ttlMs: number = DEFAULT_TTL_MS,
  forceRefresh: boolean = false
) {
  const query = params?.toString() ?? "";
  const cacheKey = `api-football:${path}:${query}`;

  if (!forceRefresh) {
    const cached = getFromCache<unknown>(cacheKey);
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

      const headers: Record<string, string> = {
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

    } catch (err: any) {
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

export interface ApiOddsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
  fixture: {
    id: number;
    date: string;
    timestamp: number;
  };
  update: string;
  bookmakers: {
    id: number;
    name: string;
    bets: {
      id: number;
      name: string;
      values: {
        value: string;
        odd: string;
      }[];
    }[];
  }[];
}

export interface ApiFixtureResponse {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
  events?: {
    time: {
      elapsed: number;
      extra: number | null;
    };
    team: {
      id: number;
      name: string;
      logo: string;
    };
    player: {
      id: number;
      name: string;
    };
    assist: {
      id: number | null;
      name: string | null;
    };
    type: string;
    detail: string;
    comments: string | null;
  }[];
}

// NOTE: Implement full normalization mapping from API-FOOTBALL odds structure
// into our internal NormalizedFixtureOdds format here. For demo purposes this
// is left as a thin wrapper that can be extended to support all markets


