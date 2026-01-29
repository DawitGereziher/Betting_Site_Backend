const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const betRoutes = require("./routes/betRoutes");
const oddsRoutes = require("./routes/oddsRoutes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const cashierRoutes = require("./routes/cashier.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*").split(",");

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (allowedOrigins.includes("*") || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-apisports-key"],
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Betting API Backend Running");
});

app.use("/api/bet", betRoutes);
app.use("/api/odds", oddsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cashier", cashierRoutes);

// Background Job: Refresh Odds Every 1 Minute
const { fetchOddsForDate } = require("./lib/oddsService");

setInterval(async () => {
    try {
        const TIMEZONE = "Africa/Addis_Ababa";
        const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE });
        const today = dateFormatter.format(new Date());

        console.log(`[Background] Auto-refreshing odds for ${today}...`);
        // forceRefresh = true to bypass cache and fetch fresh data
        await fetchOddsForDate(today, TIMEZONE, true);
        console.log(`[Background] Odds refreshed successfully for ${today}`);
    } catch (error) {
        console.error("[Background] Failed to refresh odds:", error);
    }
}, 5 * 60 * 1000); // 5 minutes

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
