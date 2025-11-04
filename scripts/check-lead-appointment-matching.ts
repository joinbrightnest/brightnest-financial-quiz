import { prisma } from '../lib/prisma';

async function checkLeadAppointmentMatching() {
  try {
    console.log('🔍 Checking lead-appointment matching...\n');

    // Get all completed quiz sessions (leads)
    const leads = await prisma.quizSession.findMany({
      where: {
        status: 'completed'
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    console.log(`📊 Total leads (completed quizzes): ${leads.length}\n`);

    // Extract emails from leads
    const leadsWithEmails = leads.map(lead => {
      const emailAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.type === 'email'
      );
      return {
        id: lead.id,
        email: emailAnswer?.value ? String(emailAnswer.value).toLowerCase().trim() : null,
        createdAt: lead.createdAt
      };
    }).filter(lead => lead.email !== null);

    console.log(`📧 Leads with emails: ${leadsWithEmails.length}\n`);

    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        customerEmail: true,
        closerId: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`📅 Total appointments: ${appointments.length}\n`);

    // Check matching
    const matchedLeads = new Set<string>();
    const unmatchedLeads: Array<{ id: string; email: string; createdAt: Date }> = [];
    const appointmentsWithLeads = new Set<string>();
    const appointmentsWithoutLeads: Array<{ id: string; email: string; closerId: string | null; status: string }> = [];

    // Match leads to appointments
    for (const lead of leadsWithEmails) {
      const matchingAppointment = appointments.find(
        apt => apt.customerEmail.toLowerCase() === lead.email
      );
      
      if (matchingAppointment) {
        matchedLeads.add(lead.id);
        appointmentsWithLeads.add(matchingAppointment.id);
      } else {
        unmatchedLeads.push(lead);
      }
    }

    // Find appointments without matching leads
    for (const appointment of appointments) {
      if (!appointmentsWithLeads.has(appointment.id)) {
        appointmentsWithoutLeads.push(appointment);
      }
    }

    console.log(`✅ Matched leads: ${matchedLeads.size}`);
    console.log(`❌ Unmatched leads (no appointment): ${unmatchedLeads.length}`);
    console.log(`📅 Appointments with matching leads: ${appointmentsWithLeads.size}`);
    console.log(`📅 Appointments without matching leads: ${appointmentsWithoutLeads.length}\n`);

    // Check appointments without closers
    const appointmentsWithoutClosers = appointments.filter(apt => apt.closerId === null);
    console.log(`⚠️  Appointments without closers: ${appointmentsWithoutClosers.length}`);
    
    if (appointmentsWithoutClosers.length > 0) {
      console.log('\n📋 Appointments without closers:');
      appointmentsWithoutClosers.forEach(apt => {
        console.log(`   ${apt.customerEmail} (${apt.status})`);
      });
    }

    // Check for unmatched leads that might need appointments
    if (unmatchedLeads.length > 0) {
      console.log(`\n📋 First 10 unmatched leads (no appointments):`);
      unmatchedLeads.slice(0, 10).forEach(lead => {
        console.log(`   ${lead.email}`);
      });
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total leads: ${leadsWithEmails.length}`);
    console.log(`   Leads with appointments: ${matchedLeads.size}`);
    console.log(`   Leads without appointments: ${unmatchedLeads.length}`);
    console.log(`   Total appointments: ${appointments.length}`);
    console.log(`   Appointments with closers: ${appointments.filter(apt => apt.closerId !== null).length}`);
    console.log(`   Appointments without closers: ${appointmentsWithoutClosers.length}`);

    if (appointmentsWithoutClosers.length === 0) {
      console.log('\n✅ All appointments have closers assigned!');
      console.log('   The "Unassigned" leads in Lead Analytics are leads without appointments.');
      console.log('   This is expected - they completed the quiz but haven\'t booked a call yet.');
    }

  } catch (error) {
    console.error('❌ Error checking lead-appointment matching:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkLeadAppointmentMatching()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });

