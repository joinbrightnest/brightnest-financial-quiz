import { PrismaClient } from '@prisma/client'

// Singleton pattern to reuse Prisma client across hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ✅ PERFORMANCE: Verify connection pooling is configured
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer')) {
  console.warn('⚠️  WARNING: DATABASE_URL does not appear to use connection pooling');
  console.warn('⚠️  For Supabase, use port 6543 and add ?pgbouncer=true');
  console.warn('⚠️  Example: postgresql://user:pass@host:6543/db?pgbouncer=true');
}

// Recommended: Set connection pool size
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
  console.warn('⚠️  RECOMMENDATION: Add connection_limit parameter to DATABASE_URL');
  console.warn('⚠️  Example: &connection_limit=10');
}

// Log connection info on startup
console.log('✅ Prisma initialized');
if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.replace('/', '')}`);
    console.log(`   Pooling: ${url.searchParams.has('pgbouncer') ? '✅ Enabled' : '⚠️  Not detected'}`);
  } catch (error) {
    console.warn('   Could not parse DATABASE_URL for logging');
  }
}
