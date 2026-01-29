
import express from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { z } from 'zod';

const router = express.Router();

// Middleware to ensure user is Admin would go here. 
// For now, we'll assume the frontend limits access or we rely on just knowing the URL/token.
// TODO: Add proper middleware `authenticateToken` and `requireRole('ADMIN')`

// Get global stats
router.get('/stats', async (req, res) => {
    try {
        const totalBets = await prisma.bet.count();
        const totalRevenue = await prisma.bet.aggregate({
            _sum: { amount: true },
        });

        // Group by status
        const betsByStatus = await prisma.bet.groupBy({
            by: ['status'],
            _count: { _all: true },
        });

        res.json({
            totalBets,
            totalRevenue: totalRevenue._sum.amount || 0,
            betsByStatus,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// List all cashiers
router.get('/cashiers', async (req, res) => {
    try {
        const cashiers = await prisma.user.findMany({
            where: { role: 'CASHIER' },
            select: { id: true, username: true, createdAt: true },
        });
        res.json(cashiers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cashiers' });
    }
});

// Create new cashier
router.post('/cashiers', async (req, res) => {
    try {
        const schema = z.object({
            username: z.string().min(3),
            password: z.string().min(6),
        });
        const { username, password } = schema.parse(req.body);

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const cashier = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'CASHIER',
            },
        });

        res.json({ id: cashier.id, username: cashier.username });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create cashier' });
    }
});

export default router;
