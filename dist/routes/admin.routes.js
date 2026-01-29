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
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Middleware to ensure user is Admin would go here. 
// For now, we'll assume the frontend limits access or we rely on just knowing the URL/token.
// TODO: Add proper middleware `authenticateToken` and `requireRole('ADMIN')`
// Get global stats
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalBets = yield prisma_1.prisma.bet.count();
        const totalRevenue = yield prisma_1.prisma.bet.aggregate({
            _sum: { amount: true },
        });
        // Group by status
        const betsByStatus = yield prisma_1.prisma.bet.groupBy({
            by: ['status'],
            _count: { _all: true },
        });
        res.json({
            totalBets,
            totalRevenue: totalRevenue._sum.amount || 0,
            betsByStatus,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}));
// List all cashiers
router.get('/cashiers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cashiers = yield prisma_1.prisma.user.findMany({
            where: { role: 'CASHIER' },
            select: { id: true, username: true, createdAt: true },
        });
        res.json(cashiers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashiers' });
    }
}));
// Create new cashier
router.post('/cashiers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = zod_1.z.object({
            username: zod_1.z.string().min(3),
            password: zod_1.z.string().min(6),
        });
        const { username, password } = schema.parse(req.body);
        const existing = yield prisma_1.prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const cashier = yield prisma_1.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'CASHIER',
            },
        });
        res.json({ id: cashier.id, username: cashier.username });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create cashier' });
    }
}));
exports.default = router;
