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
const express_1 = require("express");
const oddsService_1 = require("../lib/oddsService");
const router = (0, express_1.Router)();
// GET /api/odds?date=YYYY-MM-DD
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = req.query.date || new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
        const forceRefresh = req.query.refresh === 'true';
        // Use default timezone for now, can be parameterized if needed
        const data = yield (0, oddsService_1.fetchOddsForDate)(date, "Africa/Addis_Ababa", forceRefresh);
        res.json(data);
    }
    catch (error) {
        console.error("Fetch Odds Error:", error);
        res.status(500).json({ error: "Failed to fetch odds" });
    }
}));
// GET /api/odds/stream?date=YYYY-MM-DD
router.get("/stream", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = req.query.date || new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
        const forceRefresh = req.query.refresh === 'true';
        // Set headers for streaming
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        yield (0, oddsService_1.streamOddsForDate)(date, "Africa/Addis_Ababa", (type, data) => {
            const chunk = JSON.stringify({ type, data }) + "\n";
            res.write(chunk);
        }, forceRefresh);
        res.end();
    }
    catch (error) {
        console.error("Stream Odds Error:", error);
        // If headers weren't sent yet
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to stream odds" });
        }
        else {
            res.end();
        }
    }
}));
// GET /api/odds/:fixtureId
router.get("/:fixtureId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fixtureId = parseInt(req.params.fixtureId);
        if (isNaN(fixtureId)) {
            return res.status(400).json({ error: "Invalid fixture ID" });
        }
        const data = yield (0, oddsService_1.getFixtureOdds)(fixtureId);
        if (!data) {
            return res.status(404).json({ error: "Fixture not found" });
        }
        res.json(data);
    }
    catch (error) {
        console.error("Get Fixture Odds Error:", error);
        res.status(500).json({ error: "Failed to get fixture odds" });
    }
}));
exports.default = router;
