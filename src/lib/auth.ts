
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

export interface TokenPayload {
    userId: string;
    username: string;
    role: Role;
}

export function generateToken(user: User): string {
    const payload: TokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
