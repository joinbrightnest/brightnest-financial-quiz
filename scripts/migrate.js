// Simple migration script for Vercel
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Running affiliate system migration...');
  
  try {
    // This will create the tables if they don't exist
    await prisma.$executeRaw`
      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "AffiliateTier" AS ENUM ('quiz', 'creator', 'agency');
    `;
    
    await prisma.$executeRaw`
      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "PayoutMethod" AS ENUM ('stripe', 'paypal', 'wise');
    `;
    
    await prisma.$executeRaw`
      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "ConversionStatus" AS ENUM ('pending', 'confirmed', 'cancelled');
    `;
    
    await prisma.$executeRaw`
      -- CreateEnum
      CREATE TYPE IF NOT EXISTS "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
    `;
    
    console.log('✅ Enums created successfully');
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
