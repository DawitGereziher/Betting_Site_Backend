const express = require('express');
const { prisma } = require('../lib/prisma');
const { comparePassword, generateToken } = require('../lib/auth');
const { z } = require('zod');

const router = express.Router();

const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token, role: user.role, username: user.username, userId: user.id });
    } catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});

// Helper to check token validity
router.get('/me', async (req, res) => {
    // TODO: Add middleware to extract user from token for this route
    // For now, client just decodes JWT or assumes validity if 200
    res.status(501).json({ message: "Not implemented yet" });
});

module.exports = router;
