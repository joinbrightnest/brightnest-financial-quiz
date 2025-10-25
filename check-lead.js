const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLead() {
  try {
    // Find the skk lead
    const sessions = await prisma.quizSession.findMany({
      where: {
        answers: {
          some: {
            value: 'skk'
          }
        }
      },
      select: {
        id: true,
        affiliateCode: true,
        answers: {
          select: {
            value: true,
            question: {
              select: {
                prompt: true
              }
            }
          }
        }
      }
    });

    console.log('Found sessions:', sessions.length);
    
    sessions.forEach(session => {
      console.log('Session ID:', session.id);
      console.log('Affiliate Code:', session.affiliateCode);
      console.log('Answers:', session.answers.map(a => `${a.question?.prompt}: ${a.value}`));
      console.log('---');
    });

    // Check affiliates
    const affiliates = await prisma.affiliate.findMany({
      select: {
        id: true,
        name: true,
        referralCode: true,
        customTrackingLink: true
      }
    });

    console.log('All affiliates:');
    affiliates.forEach(affiliate => {
      console.log(`Name: ${affiliate.name}, Referral Code: ${affiliate.referralCode}, Custom Link: ${affiliate.customTrackingLink}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLead();
