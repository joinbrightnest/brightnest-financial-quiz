const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConversionRate() {
  try {
    console.log('🔍 Checking conversion rate calculation...\n');
    
    // Find Stefan's closer record
    const closer = await prisma.closer.findFirst({
      where: { name: 'Stefan' }
    });

    if (!closer) {
      console.log('❌ Closer not found');
      return;
    }

    console.log(`📊 Closer: ${closer.name} (ID: ${closer.id})`);

    // Get all appointments for this closer
    const appointments = await prisma.appointment.findMany({
      where: { closerId: closer.id },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        outcome: true,
        saleValue: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`\n📊 All Appointments (${appointments.length} total):`);
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.customerName} (${apt.customerEmail})`);
      console.log(`   - Outcome: ${apt.outcome || 'Not set'}`);
      console.log(`   - Sale Value: $${apt.saleValue || 0}`);
      console.log(`   - Updated: ${apt.updatedAt.toISOString()}`);
      console.log('');
    });

    // Calculate conversion rate
    const totalCalls = appointments.length;
    const totalConversions = appointments.filter(apt => apt.outcome === 'converted').length;
    const conversionRate = totalCalls > 0 ? (totalConversions / totalCalls) * 100 : 0;

    console.log(`💰 Conversion Rate Calculation:`);
    console.log(`- Total Calls: ${totalCalls}`);
    console.log(`- Total Conversions: ${totalConversions}`);
    console.log(`- Conversion Rate: ${totalConversions}/${totalCalls} × 100 = ${conversionRate.toFixed(1)}%`);

    // Check if there are any appointments with null outcome
    const appointmentsWithNullOutcome = appointments.filter(apt => !apt.outcome);
    if (appointmentsWithNullOutcome.length > 0) {
      console.log(`\n⚠️ Found ${appointmentsWithNullOutcome.length} appointments with null outcome:`);
      appointmentsWithNullOutcome.forEach((apt, index) => {
        console.log(`${index + 1}. ${apt.customerName} - Outcome: ${apt.outcome}`);
      });
    }

    // Check if there are any appointments with 'not_interested' outcome
    const notInterestedAppointments = appointments.filter(apt => apt.outcome === 'not_interested');
    console.log(`\n📊 Outcome Breakdown:`);
    console.log(`- Converted: ${totalConversions}`);
    console.log(`- Not Interested: ${notInterestedAppointments.length}`);
    console.log(`- Other/Null: ${totalCalls - totalConversions - notInterestedAppointments.length}`);

  } catch (error) {
    console.error('❌ Error checking conversion rate:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversionRate();
