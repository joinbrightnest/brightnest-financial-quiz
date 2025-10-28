import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

async function runMigration() {
  try {
    console.log('🔄 Starting email normalization migration...');

    // Get count before migration
    const beforeCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE customer_email != LOWER(customer_email)
    `;

    const mixedCaseCount = Number(beforeCount[0]?.count || 0);
    console.log(`📊 Found ${mixedCaseCount} appointments with mixed-case emails`);

    // Update all appointment emails to lowercase
    const result = await prisma.$executeRaw`
      UPDATE appointments 
      SET customer_email = LOWER(customer_email)
      WHERE customer_email != LOWER(customer_email)
    `;

    console.log(`✅ Updated ${result} appointment emails to lowercase`);

    // Verify the fix
    const afterCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE customer_email != LOWER(customer_email)
    `;

    const remainingCount = Number(afterCount[0]?.count || 0);

    // Get sample of updated appointments
    const sampleAppointments = await prisma.appointment.findMany({
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        outcome: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      message: 'Email normalization completed',
      stats: {
        mixedCaseCountBefore: mixedCaseCount,
        updatedCount: result,
        remainingMixedCase: remainingCount,
      },
      sampleAppointments,
    });
  } catch (error) {
    console.error('❌ Error during email migration:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  return runMigration();
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }

  return runMigration();
}
