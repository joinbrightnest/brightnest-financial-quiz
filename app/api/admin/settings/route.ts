import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET settings
export async function GET() {
  try {
    // Get current qualification threshold from database
    // For now, we'll use a simple approach and store it in a settings table
    // If settings table doesn't exist, we'll create a simple key-value store
    
    const settings = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE key = 'qualification_threshold'
    `.catch(async () => {
      // If Settings table doesn't exist, create it and insert default value
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Settings" (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('qualification_threshold', '17')
        ON CONFLICT (key) DO NOTHING
      `;
      
      return [{ key: 'qualification_threshold', value: '17' }];
    });

    return NextResponse.json({
      success: true,
      settings: settings[0] || { key: 'qualification_threshold', value: '17' }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
}

// POST settings (update)
export async function POST(request: NextRequest) {
  try {
    const { qualificationThreshold } = await request.json();

    if (!qualificationThreshold || qualificationThreshold < 1 || qualificationThreshold > 20) {
      return NextResponse.json({
        success: false,
        error: 'Invalid qualification threshold. Must be between 1 and 20.'
      }, { status: 400 });
    }

    // Ensure Settings table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Settings" (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Update or insert the qualification threshold
    await prisma.$executeRaw`
      INSERT INTO "Settings" (key, value) 
      VALUES ('qualification_threshold', ${qualificationThreshold.toString()})
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = ${qualificationThreshold.toString()},
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({
      success: true,
      message: 'Qualification threshold updated successfully',
      qualificationThreshold
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 });
  }
}
