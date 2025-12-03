import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const functions = [
        'update_updated_at_column',
        'update_affiliate_custom_link',
    ];

    console.log('Fixing function search paths...');

    for (const func of functions) {
        try {
            // We assume these are parameterless functions based on standard trigger function patterns.
            // If they have parameters, this ALTER command might need adjustment, but usually trigger functions are parameterless.
            await prisma.$executeRawUnsafe(`ALTER FUNCTION public."${func}"() SET search_path = public;`);
            console.log(`✅ Fixed search_path for "${func}"`);
        } catch (error) {
            console.error(`❌ Failed to fix "${func}":`, error);
        }
    }

    console.log('Finished fixing functions.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
