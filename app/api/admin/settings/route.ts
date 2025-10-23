import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET settings
export async function GET() {
  try {
    // Get current settings from database
    // If settings table doesn't exist, create it and insert default values
    const settings = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE key IN ('qualification_threshold', 'commission_hold_days')
    `.catch(async () => {
      // If Settings table doesn't exist, create it and insert default values
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
        VALUES 
          ('qualification_threshold', '17'),
          ('commission_hold_days', '30')
        ON CONFLICT (key) DO NOTHING
      `;
      
      return [
        { key: 'qualification_threshold', value: '17' },
        { key: 'commission_hold_days', value: '30' }
      ];
    });

    // Convert array to object for easier access
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      settings: {
        qualificationThreshold: parseInt(settingsObj.qualification_threshold || '17'),
        commissionHoldDays: parseInt(settingsObj.commission_hold_days || '30')
      }
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
    const { qualificationThreshold, commissionHoldDays } = await request.json();

    // Validate qualification threshold
    if (qualificationThreshold !== undefined && (qualificationThreshold < 1 || qualificationThreshold > 20)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid qualification threshold. Must be between 1 and 20.'
      }, { status: 400 });
    }

    // Validate commission hold days
    if (commissionHoldDays !== undefined && (commissionHoldDays < 0 || commissionHoldDays > 365)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid commission hold days. Must be between 0 and 365.'
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

    const updates = [];
    
    // Update qualification threshold if provided
    if (qualificationThreshold !== undefined) {
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('qualification_threshold', ${qualificationThreshold.toString()})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${qualificationThreshold.toString()},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('qualification threshold');
    }

    // Update commission hold days if provided
    if (commissionHoldDays !== undefined) {
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('commission_hold_days', ${commissionHoldDays.toString()})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${commissionHoldDays.toString()},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('commission hold period');
    }

    return NextResponse.json({
      success: true,
      message: `${updates.join(' and ')} updated successfully`,
      qualificationThreshold,
      commissionHoldDays
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 });
  }
}
