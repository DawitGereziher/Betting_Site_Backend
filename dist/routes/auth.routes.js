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
const loginSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = loginSchema.parse(req.body);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = yield (0, auth_1.comparePassword)(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user);
        res.json({ token, role: user.role, username: user.username, userId: user.id });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
}));
// Helper to check token validity
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Add middleware to extract user from token for this route
    // For now, client just decodes JWT or assumes validity if 200
    res.status(501).json({ message: "Not implemented yet" });
}));
exports.default = router;
