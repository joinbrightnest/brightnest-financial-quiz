import { prisma } from '../lib/prisma';

/**
 * Fix unassigned appointments by assigning them to available closers
 * Uses round-robin assignment (same logic as Calendly webhook)
 */
async function fixUnassignedAppointments() {
  try {
    console.log('🔍 Checking for unassigned appointments...');

    // Find all unassigned appointments (that should have closers)
    // Query without status filter first to avoid enum type issues
    const allUnassignedAppointments = await prisma.appointment.findMany({
      where: {
        closerId: null
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        scheduledAt: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // Assign oldest first
      }
    });

    // Filter to only active appointments (scheduled or confirmed)
    const unassignedAppointments = allUnassignedAppointments.filter(
      apt => apt.status === 'scheduled' || apt.status === 'confirmed'
    );

    console.log(`📋 Found ${unassignedAppointments.length} unassigned appointments`);

    if (unassignedAppointments.length === 0) {
      console.log('✅ No unassigned appointments to fix!');
      return;
    }

    // Find all active, approved closers
    const availableClosers = await prisma.closer.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        totalCalls: true
      },
      orderBy: {
        totalCalls: 'asc' // Round-robin: assign to closer with fewer calls
      }
    });

    if (availableClosers.length === 0) {
      console.error('❌ No available closers to assign appointments to!');
      console.error('   Please create at least one active, approved closer before running this script.');
      return;
    }

    console.log(`👥 Found ${availableClosers.length} available closers:`);
    availableClosers.forEach((closer, index) => {
      console.log(`   ${index + 1}. ${closer.name} (${closer.totalCalls} calls)`);
    });

    // Round-robin assignment
    let closerIndex = 0;
    let assignedCount = 0;

    console.log('\n🔄 Assigning appointments...\n');

    for (const appointment of unassignedAppointments) {
      // Get the next closer (round-robin)
      const assignedCloser = availableClosers[closerIndex];
      
      // Assign the appointment to the closer
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          closerId: assignedCloser.id,
          status: appointment.status === 'scheduled' 
            ? 'confirmed' 
            : appointment.status
        }
      });

      // Increment the closer's total calls count
      await prisma.closer.update({
        where: { id: assignedCloser.id },
        data: {
          totalCalls: {
            increment: 1
          }
        }
      });

      console.log(`✅ Assigned ${appointment.customerEmail} (${appointment.customerName}) → ${assignedCloser.name}`);
      
      assignedCount++;
      
      // Move to next closer (round-robin)
      closerIndex = (closerIndex + 1) % availableClosers.length;
    }

    console.log(`\n🎉 Successfully assigned ${assignedCount} appointments to closers!`);

    // Show final distribution
    console.log('\n📊 Final closer distribution:');
    const updatedClosers = await prisma.closer.findMany({
      where: {
        id: { in: availableClosers.map(c => c.id) }
      },
      select: {
        name: true,
        totalCalls: true
      },
      orderBy: {
        totalCalls: 'desc'
      }
    });

    updatedClosers.forEach(closer => {
      console.log(`   ${closer.name}: ${closer.totalCalls} calls`);
    });

  } catch (error) {
    console.error('❌ Error fixing unassigned appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixUnassignedAppointments()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

