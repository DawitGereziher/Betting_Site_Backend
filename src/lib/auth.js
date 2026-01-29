const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Removed User, Role import as they are types

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword
};
