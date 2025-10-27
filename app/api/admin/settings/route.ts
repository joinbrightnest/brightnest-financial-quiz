import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

// GET settings
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    // Get current settings from database
    // If settings table doesn't exist, create it and insert default values
    const settings = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE key IN ('qualification_threshold', 'commission_hold_days', 'minimum_payout', 'payout_schedule', 'new_deal_amount_potential', 'terminal_outcomes')
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
          ('commission_hold_days', '30'),
          ('minimum_payout', '50'),
          ('payout_schedule', 'monthly-1st'),
          ('new_deal_amount_potential', '5000'),
          ('terminal_outcomes', '["not_interested", "converted"]')
        ON CONFLICT (key) DO NOTHING
      `;
      
      return [
        { key: 'qualification_threshold', value: '17' },
        { key: 'commission_hold_days', value: '30' },
        { key: 'minimum_payout', value: '50' },
        { key: 'payout_schedule', value: 'monthly-1st' },
        { key: 'new_deal_amount_potential', value: '5000' },
        { key: 'terminal_outcomes', value: '["not_interested", "converted"]' }
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
        commissionHoldDays: parseInt(settingsObj.commission_hold_days || '30'),
        minimumPayout: parseFloat(settingsObj.minimum_payout || '50'),
        payoutSchedule: settingsObj.payout_schedule || 'monthly-1st',
        newDealAmountPotential: parseFloat(settingsObj.new_deal_amount_potential || '5000'),
        terminalOutcomes: JSON.parse(settingsObj.terminal_outcomes || '["not_interested", "converted"]')
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
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { qualificationThreshold, commissionHoldDays, minimumPayout, payoutSchedule, newDealAmountPotential, terminalOutcomes } = await request.json();

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

    // Validate minimum payout
    if (minimumPayout !== undefined && (minimumPayout < 0 || minimumPayout > 10000)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid minimum payout. Must be between 0 and 10000.'
      }, { status: 400 });
    }

    // Validate payout schedule
    if (payoutSchedule !== undefined && !['weekly', 'biweekly', 'monthly-1st', 'monthly-15th', 'monthly-last', 'quarterly'].includes(payoutSchedule)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payout schedule. Must be weekly, biweekly, monthly-1st, monthly-15th, monthly-last, or quarterly.'
      }, { status: 400 });
    }

    // Validate new deal amount potential
    if (newDealAmountPotential !== undefined && (newDealAmountPotential < 0 || newDealAmountPotential > 100000)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid new deal amount potential. Must be between 0 and 100000.'
      }, { status: 400 });
    }

    // Validate terminal outcomes
    if (terminalOutcomes !== undefined) {
      if (!Array.isArray(terminalOutcomes)) {
        return NextResponse.json({
          success: false,
          error: 'Terminal outcomes must be an array.'
        }, { status: 400 });
      }
      
      const validOutcomes = ['converted', 'not_interested', 'needs_follow_up', 'wrong_number', 'no_answer', 'callback_requested', 'rescheduled'];
      const invalidOutcomes = terminalOutcomes.filter((outcome: string) => !validOutcomes.includes(outcome));
      
      if (invalidOutcomes.length > 0) {
        return NextResponse.json({
          success: false,
          error: `Invalid outcome(s): ${invalidOutcomes.join(', ')}. Valid outcomes are: ${validOutcomes.join(', ')}.`
        }, { status: 400 });
      }
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

    // Update minimum payout if provided
    if (minimumPayout !== undefined) {
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('minimum_payout', ${minimumPayout.toString()})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${minimumPayout.toString()},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('minimum payout');
    }

    // Update payout schedule if provided
    if (payoutSchedule !== undefined) {
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('payout_schedule', ${payoutSchedule})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${payoutSchedule},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('payout schedule');
    }

    // Update new deal amount potential if provided
    if (newDealAmountPotential !== undefined) {
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('new_deal_amount_potential', ${newDealAmountPotential.toString()})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${newDealAmountPotential.toString()},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('new deal amount potential');
    }

    // Update terminal outcomes if provided
    if (terminalOutcomes !== undefined) {
      const terminalOutcomesJson = JSON.stringify(terminalOutcomes);
      await prisma.$executeRaw`
        INSERT INTO "Settings" (key, value) 
        VALUES ('terminal_outcomes', ${terminalOutcomesJson})
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = ${terminalOutcomesJson},
          updated_at = CURRENT_TIMESTAMP
      `;
      updates.push('terminal outcomes');
    }

    return NextResponse.json({
      success: true,
      message: `${updates.join(' and ')} updated successfully`,
      qualificationThreshold,
      commissionHoldDays,
      minimumPayout,
      payoutSchedule,
      newDealAmountPotential,
      terminalOutcomes
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 });
  }
}
