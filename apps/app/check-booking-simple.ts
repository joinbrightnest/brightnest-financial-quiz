import { prisma } from './lib/prisma';

async function check() {
  // Check appointments for test email
  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { customerEmail: { contains: 'test' } },
        { customerEmail: { contains: 'usertest' } }
      ]
    },
    include: {
      closer: true,
      quizSession: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  console.log(`\n📞 Found ${appointments.length} test appointments:\n`);
  
  appointments.forEach(apt => {
    console.log({
      id: apt.id,
      email: apt.customerEmail,
      quizSessionId: apt.quizSessionId,
      hasQuizSession: !!apt.quizSession,
      scheduledAt: apt.scheduledAt,
      status: apt.status,
      outcome: apt.outcome,
      closer: apt.closer?.name,
      createdAt: apt.createdAt
    });
    console.log('---');
  });

  await prisma.$disconnect();
}

check().catch(console.error);
