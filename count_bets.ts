
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const betCount = await prisma.bet.count();
        console.log(`CURRENT_BET_COUNT: ${betCount}`);

        // List latest 5 bets to show references
        const bets = await prisma.bet.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { reference: true, createdAt: true, amount: true }
        });
        console.log('LATEST_BETS:', JSON.stringify(bets, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
