const { PrismaClient } = require("@prisma/client");

// DEBUG: Log current connection string (Masked)
const dbUrl = process.env.DATABASE_URL || "UNDEFINED";
let maskedUrl = "UNDEFINED";
try {
    if (dbUrl !== "UNDEFINED" && dbUrl.includes("@")) {
        // Basic masking: mysql://user:password@host... -> mysql://user:****@host...
        maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    } else {
        maskedUrl = dbUrl;
    }
} catch (e) {
    maskedUrl = "ERROR_MASKING";
}

console.log("----------------------------------------------------------------");
console.log(`[DEBUG] Current Working Directory: ${process.cwd()}`);
console.log(`[DEBUG] Loaded DATABASE_URL: ${maskedUrl}`);
console.log("----------------------------------------------------------------");

const prisma =
    global.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}

module.exports = { prisma };
