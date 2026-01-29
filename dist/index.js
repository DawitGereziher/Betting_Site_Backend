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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const betRoutes_1 = __importDefault(require("./routes/betRoutes"));
const oddsRoutes_1 = __importDefault(require("./routes/oddsRoutes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cashier_routes_1 = __importDefault(require("./routes/cashier.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*").split(",");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin is allowed
        if (allowedOrigins.includes("*") || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-apisports-key"],
    credentials: true
}));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Betting API Backend Running");
});
app.use("/api/bet", betRoutes_1.default);
app.use("/api/odds", oddsRoutes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/cashier", cashier_routes_1.default);
// Background Job: Refresh Odds Every 1 Minute
const oddsService_1 = require("./lib/oddsService");
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TIMEZONE = "Africa/Addis_Ababa";
        const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });
        const today = dateFormatter.format(new Date());
        console.log(`[Background] Auto-refreshing odds for ${today}...`);
        // forceRefresh = true to bypass cache and fetch fresh data
        yield (0, oddsService_1.fetchOddsForDate)(today, TIMEZONE, true);
        console.log(`[Background] Odds refreshed successfully for ${today}`);
    }
    catch (error) {
        console.error("[Background] Failed to refresh odds:", error);
    }
}), 5 * 60 * 1000); // 5 minutes
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
