import { prisma } from '../lib/prisma';

async function checkUnassignedAppointments() {
  try {
    console.log('🔍 Checking for unassigned appointments...\n');

    // Find ALL unassigned appointments (any status)
    const allUnassigned = await prisma.appointment.findMany({
      where: {
        closerId: null
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        status: true,
        createdAt: true,
        scheduledAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Total unassigned appointments: ${allUnassigned.length}\n`);

    if (allUnassigned.length === 0) {
      console.log('✅ No unassigned appointments found!');
      console.log('\n📝 This means all appointments have closers assigned.');
      console.log('   If you\'re seeing "Unassigned" in Lead Analytics, those leads likely don\'t have appointments yet.');
      return;
    }

    // Group by status
    const byStatus = allUnassigned.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Unassigned appointments by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n📋 Detailed list:\n');
    allUnassigned.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.customerName} (${apt.customerEmail})`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Created: ${apt.createdAt.toISOString()}`);
      console.log(`   Scheduled: ${apt.scheduledAt?.toISOString() || 'N/A'}`);
      console.log('');
    });

    // Check if there are active, approved closers
    const availableClosers = await prisma.closer.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        totalCalls: true
      }
    });

    console.log(`\n👥 Available closers: ${availableClosers.length}`);
    if (availableClosers.length > 0) {
      console.log('   Closers:');
      availableClosers.forEach((closer, index) => {
        console.log(`   ${index + 1}. ${closer.name} (${closer.totalCalls} calls)`);
      });
    } else {
      console.log('   ⚠️ No active, approved closers available!');
      console.log('   This is why appointments can\'t be assigned.');
    }

  } catch (error) {
    console.error('❌ Error checking unassigned appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUnassignedAppointments()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });

