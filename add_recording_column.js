const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRecordingLinkColumn() {
  try {
    console.log('🔧 Adding recording_link column to appointments table...\n');
    
    // Add the recording_link column
    await prisma.$executeRaw`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS recording_link TEXT;
    `;
    
    console.log('✅ Successfully added recording_link column to appointments table');
    
    // Verify the column was added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name = 'recording_link';
    `;
    
    console.log('📊 Column verification:', result);
    
  } catch (error) {
    console.error('❌ Error adding recording_link column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRecordingLinkColumn();
