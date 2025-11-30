
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditManuel() {
    console.log('🔍 STARTING AUDIT FOR AFFILIATE: MANUEL');
    console.log('----------------------------------------');

    // 1. Get all Quiz Sessions for Manuel
    const sessions = await prisma.quizSession.findMany({
        where: {
            affiliateCode: 'manuel',
            status: 'completed'
        },
        include: {
            answers: {
                include: {
                    question: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 FOUND ${sessions.length} COMPLETED QUIZ SESSIONS:`);

    const sessionMap = new Map();

    sessions.forEach(s => {
        const emailAnswer = s.answers.find(a =>
            a.question?.type === 'email' ||
            a.question?.prompt.toLowerCase().includes('email')
        );
        const email = emailAnswer?.value || 'NO_EMAIL';

        console.log(`   - Session ID: ${s.id}`);
        console.log(`     Created: ${s.createdAt.toISOString()}`);
        console.log(`     Email: ${email}`);

        sessionMap.set(s.id, { email, createdAt: s.createdAt });
    });

    console.log('\n----------------------------------------');

    // 2. Get all Affiliate Conversions for Manuel
    const conversions = await prisma.affiliateConversion.findMany({
        where: {
            referralCode: 'manuel',
            conversionType: 'booking'
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 FOUND ${conversions.length} BOOKING CONVERSIONS:`);

    conversions.forEach(c => {
        const sessionInfo = c.quizSessionId ? sessionMap.get(c.quizSessionId) : null;

        console.log(`   - Conversion ID: ${c.id}`);
        console.log(`     Created: ${c.createdAt.toISOString()}`);
        console.log(`     QuizSessionId: ${c.quizSessionId || 'NULL'}`);

        if (sessionInfo) {
            console.log(`     ✅ LINKED TO SESSION: ${sessionInfo.email}`);
        } else if (c.quizSessionId) {
            console.log(`     ❌ LINKED TO UNKNOWN SESSION`);
        } else {
            console.log(`     ⚠️ ORPHAN CONVERSION (No Session Link)`);
        }
    });

    console.log('\n----------------------------------------');
    console.log('🏁 AUDIT COMPLETE');
}

auditManuel()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
