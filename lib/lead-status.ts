import { prisma } from './prisma';

export interface LeadStatusInfo {
  status: 'completed' | 'booked';
  label: string;
  color: string;
  description: string;
  affiliateCode?: string | null;
  appointmentId?: string | null;
}

/**
 * Determine the actual lead status based on their journey
 */
export async function getLeadStatus(sessionId: string): Promise<LeadStatusInfo> {
  try {
    // Check if there's an appointment linked to this session
    const appointment = await prisma.appointment.findFirst({
      where: { 
        // For now, we'll link by email since sessionId relation is not set up
        customerEmail: {
          in: await getSessionEmail(sessionId)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (appointment) {
      return {
        status: 'booked',
        label: 'Booked',
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        description: 'Booked a call',
        affiliateCode: appointment.affiliateCode,
        appointmentId: appointment.id
      };
    }

    // No appointment found - they only completed the quiz
    return {
      status: 'completed',
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border border-green-200',
      description: 'Completed quiz with contact info'
    };
  } catch (error) {
    console.error('Error determining lead status:', error);
    // Fallback to completed if there's an error
    return {
      status: 'completed',
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border border-green-200',
      description: 'Completed quiz with contact info'
    };
  }
}

/**
 * Get lead status for multiple sessions efficiently
 */
export async function getLeadStatuses(sessionIds: string[]): Promise<Record<string, LeadStatusInfo>> {
  try {
    console.log('Getting lead statuses for sessionIds:', sessionIds);
    
    // Get emails for all sessions
    const sessionEmails: Record<string, string> = {};
    for (const sessionId of sessionIds) {
      const email = await getSessionEmail(sessionId);
      if (email) {
        sessionEmails[sessionId] = email;
      }
    }

    console.log('Session emails:', sessionEmails);

    // Get all appointments for these emails
    const emails = Object.values(sessionEmails);
    const appointments = await prisma.appointment.findMany({
      where: { 
        customerEmail: { in: emails }
      }
    });

    console.log('Found appointments:', appointments.length);

    // Group appointments by email
    const appointmentsByEmail = appointments.reduce((acc, appointment) => {
      acc[appointment.customerEmail] = appointment;
      return acc;
    }, {} as Record<string, any>);

    // Determine status for each session
    const statuses: Record<string, LeadStatusInfo> = {};
    
    for (const sessionId of sessionIds) {
      const email = sessionEmails[sessionId];
      const appointment = email ? appointmentsByEmail[email] : null;
      
      if (appointment) {
        statuses[sessionId] = {
          status: 'booked',
          label: 'Booked',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          description: 'Booked a call',
          affiliateCode: appointment.affiliateCode,
          appointmentId: appointment.id
        };
      } else {
        statuses[sessionId] = {
          status: 'completed',
          label: 'Completed',
          color: 'bg-green-100 text-green-800 border border-green-200',
          description: 'Completed quiz with contact info',
          affiliateCode: null,
          appointmentId: null
        };
      }
    }

    console.log('Final statuses:', statuses);
    return statuses;
  } catch (error) {
    console.error('Error determining lead statuses:', error);
    // Fallback to completed for all if there's an error
    const statuses: Record<string, LeadStatusInfo> = {};
    for (const sessionId of sessionIds) {
      statuses[sessionId] = {
        status: 'completed',
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border border-green-200',
        description: 'Completed quiz with contact info',
        affiliateCode: null,
        appointmentId: null
      };
    }
    return statuses;
  }
}

/**
 * Helper function to get email from a quiz session
 * Uses the contact information that's already available in the CRM
 */
async function getSessionEmail(sessionId: string): Promise<string | null> {
  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!session) return null;

    // First try to find email in quiz answers
    const emailAnswer = session.answers.find(a => 
      a.question?.prompt?.toLowerCase().includes('email') ||
      a.question?.type === 'email'
    );

    if (emailAnswer?.value) {
      return emailAnswer.value as string;
    }

    // Fallback: look for any answer that looks like an email
    for (const answer of session.answers) {
      if (answer.value && typeof answer.value === 'string' && answer.value.includes('@')) {
        return answer.value;
      }
    }

    // If no email found in answers, return null
    // The CRM will show the contact info but we can't match it to appointments
    return null;
  } catch (error) {
    console.error('Error getting session email:', error);
    return null;
  }
}
