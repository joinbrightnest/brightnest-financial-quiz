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
    // Get current settings from database using Prisma ORM
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            'qualification_threshold',
            'commission_hold_days',
            'minimum_payout',
            'payout_schedule',
            'new_deal_amount_potential',
            'terminal_outcomes'
          ]
        }
      }
    });

    // Convert array to object for easier access
    const settingsObj = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Default values if settings don't exist
    const defaults = {
      qualificationThreshold: 17,
      commissionHoldDays: 30,
      minimumPayout: 50,
      payoutSchedule: 'monthly-1st',
      newDealAmountPotential: 5000,
      terminalOutcomes: ['not_interested', 'converted']
    };

    return NextResponse.json({
      success: true,
      settings: {
        qualificationThreshold: settingsObj.qualification_threshold ? parseInt(settingsObj.qualification_threshold) : defaults.qualificationThreshold,
        commissionHoldDays: settingsObj.commission_hold_days ? parseInt(settingsObj.commission_hold_days) : defaults.commissionHoldDays,
        minimumPayout: settingsObj.minimum_payout ? parseFloat(settingsObj.minimum_payout) : defaults.minimumPayout,
        payoutSchedule: settingsObj.payout_schedule || defaults.payoutSchedule,
        newDealAmountPotential: settingsObj.new_deal_amount_potential ? parseFloat(settingsObj.new_deal_amount_potential) : defaults.newDealAmountPotential,
        terminalOutcomes: settingsObj.terminal_outcomes ? JSON.parse(settingsObj.terminal_outcomes) : defaults.terminalOutcomes
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

    const updates = [];
    const updatePromises = [];

    // Update qualification threshold if provided
    if (qualificationThreshold !== undefined) {
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'qualification_threshold' },
        update: { value: qualificationThreshold.toString() },
        create: { key: 'qualification_threshold', value: qualificationThreshold.toString() }
      }));
      updates.push('qualification threshold');
    }

    // Update commission hold days if provided
    if (commissionHoldDays !== undefined) {
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'commission_hold_days' },
        update: { value: commissionHoldDays.toString() },
        create: { key: 'commission_hold_days', value: commissionHoldDays.toString() }
      }));
      updates.push('commission hold period');
    }

    // Update minimum payout if provided
    if (minimumPayout !== undefined) {
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'minimum_payout' },
        update: { value: minimumPayout.toString() },
        create: { key: 'minimum_payout', value: minimumPayout.toString() }
      }));
      updates.push('minimum payout');
    }

    // Update payout schedule if provided
    if (payoutSchedule !== undefined) {
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'payout_schedule' },
        update: { value: payoutSchedule },
        create: { key: 'payout_schedule', value: payoutSchedule }
      }));
      updates.push('payout schedule');
    }

    // Update new deal amount potential if provided
    if (newDealAmountPotential !== undefined) {
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'new_deal_amount_potential' },
        update: { value: newDealAmountPotential.toString() },
        create: { key: 'new_deal_amount_potential', value: newDealAmountPotential.toString() }
      }));
      updates.push('new deal amount potential');
    }

    // Update terminal outcomes if provided
    if (terminalOutcomes !== undefined) {
      const terminalOutcomesJson = JSON.stringify(terminalOutcomes);
      updatePromises.push(prisma.settings.upsert({
        where: { key: 'terminal_outcomes' },
        update: { value: terminalOutcomesJson },
        create: { key: 'terminal_outcomes', value: terminalOutcomesJson }
      }));
      updates.push('terminal outcomes');
    }

    // Execute all updates in parallel
    await prisma.$transaction(updatePromises);

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
