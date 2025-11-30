import { prisma } from './lib/prisma';

async function checkTestUser() {
  console.log("🔍 Checking Test User lead...\n");
  
  // Find quiz session
  const session = await prisma.quizSession.findFirst({
    where: {
      answers: {
        some: {
          value: {
            path: '$',
            string_contains: 'Test User'
          }
        }
      }
    },
    include: {
      answers: {
        include: {
          question: true
        }
      },
      appointments: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!session) {
    console.log("❌ No quiz session found for Test User");
    return;
  }

  console.log("✅ Found quiz session:", {
    id: session.id,
    affiliateCode: session.affiliateCode,
    completedAt: session.completedAt,
    appointmentsCount: session.appointments.length
  });

  // Get email from answers
  const emailAnswer = session.answers.find(a => 
    a.question?.prompt?.toLowerCase().includes('email')
  );
  const email = emailAnswer?.value as any;
  console.log("\n📧 Email:", email);

  // Check for appointments by email
  const appointments = await prisma.appointment.findMany({
    where: {
      customerEmail: email?.toLowerCase()
    },
    include: {
      closer: true,
      quizSession: true
    }
  });

  console.log("\n📞 Appointments found:", appointments.length);
  appointments.forEach(apt => {
    console.log({
      id: apt.id,
      quizSessionId: apt.quizSessionId,
      customerEmail: apt.customerEmail,
      scheduledAt: apt.scheduledAt,
      status: apt.status,
      outcome: apt.outcome,
      closer: apt.closer?.name
    });
  });

  await prisma.$disconnect();
}

checkTestUser().catch(console.error);
