const { Router } = require("express");
const { fetchOddsForDate, getFixtureOdds, streamOddsForDate } = require("../lib/oddsService");

const router = Router();

// GET /api/odds?date=YYYY-MM-DD
router.get("/", async (req, res) => {
    try {
        const date = req.query.date || new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
        const forceRefresh = req.query.refresh === 'true';
        // Use default timezone for now, can be parameterized if needed
        const data = await fetchOddsForDate(date, "Africa/Addis_Ababa", forceRefresh);
        res.json(data);
    } catch (error) {
        console.error("Fetch Odds Error:", error);
        res.status(500).json({ error: "Failed to fetch odds" });
    }
});

// GET /api/odds/stream?date=YYYY-MM-DD
router.get("/stream", async (req, res) => {
    try {
        const date = req.query.date || new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
        const forceRefresh = req.query.refresh === 'true';

        // Set headers for streaming
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await streamOddsForDate(date, "Africa/Addis_Ababa", (type, data) => {
            const chunk = JSON.stringify({ type, data }) + "\n";
            res.write(chunk);
        }, forceRefresh);

        res.end();
    } catch (error) {
        console.error("Stream Odds Error:", error);
        // If headers weren't sent yet
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to stream odds" });
        } else {
            res.end();
        }
    }
});

// GET /api/odds/:fixtureId
router.get("/:fixtureId", async (req, res) => {
    try {
        const fixtureId = parseInt(req.params.fixtureId);
        if (isNaN(fixtureId)) {
            return res.status(400).json({ error: "Invalid fixture ID" });
        }
        const data = await getFixtureOdds(fixtureId);
        if (!data) {
            return res.status(404).json({ error: "Fixture not found" });
        }
        res.json(data);
    } catch (error) {
        console.error("Get Fixture Odds Error:", error);
        res.status(500).json({ error: "Failed to get fixture odds" });
    }
});

module.exports = router;
