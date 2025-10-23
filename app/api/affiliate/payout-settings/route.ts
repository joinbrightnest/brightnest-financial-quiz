import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get payout settings from database
    const settings = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE key IN ('minimum_payout', 'payout_schedule')
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
          ('minimum_payout', '50'),
          ('payout_schedule', 'monthly')
        ON CONFLICT (key) DO NOTHING
      `;
      
      return [
        { key: 'minimum_payout', value: '50' },
        { key: 'payout_schedule', value: 'monthly' }
      ];
    });

    // Convert array to object for easier access
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Format payout schedule for display
    const scheduleMap: { [key: string]: string } = {
      'weekly': 'Weekly (Every Monday)',
      'biweekly': 'Bi-weekly (Every 2 weeks)',
      'monthly': 'Monthly (1st of each month)',
      'quarterly': 'Quarterly (Every 3 months)'
    };

    return NextResponse.json({
      success: true,
      settings: {
        minimumPayout: parseFloat(settingsObj.minimum_payout || '50'),
        payoutSchedule: settingsObj.payout_schedule || 'monthly',
        payoutScheduleDisplay: scheduleMap[settingsObj.payout_schedule || 'monthly']
      }
    });
  } catch (error) {
    console.error('Error fetching payout settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payout settings'
    }, { status: 500 });
  }
}
