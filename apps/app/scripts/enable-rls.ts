import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tables = [
        'closer_scripts',
        'closer_script_assignments',
        'notes',
        'Settings',
        'tasks',
        'normal_website_clicks',
        'articles',
        'users',
        'quiz_answers',
        'results',
        'loading_screens',
        'quiz_questions',
        'quiz_sessions',
        'article_templates',
        'article_triggers',
        'article_views',
        'affiliate_payouts',
        'affiliate_conversions',
        'affiliates',
        '_prisma_migrations',
        'affiliate_clicks',
        'appointments',
        'affiliate_audit_logs',
        'closers',
        'closer_audit_logs',
    ];

    console.log('Enabling RLS on tables...');

    for (const table of tables) {
        try {
            // Use quote identifiers to handle case sensitivity and special characters
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
            console.log(`✅ Enabled RLS on "${table}"`);
        } catch (error) {
            console.error(`❌ Failed to enable RLS on "${table}":`, error);
        }
    }

    console.log('Finished enabling RLS.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
