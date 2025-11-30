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
    // PRIMARY: Check if there's an appointment directly linked to this session via quizSessionId
    const directAppointment = await prisma.appointment.findFirst({
      where: {
        quizSessionId: sessionId
      },
      orderBy: { createdAt: 'desc' }
    });

    if (directAppointment) {
      console.log('✅ Found appointment via direct session link:', {
        sessionId,
        appointmentId: directAppointment.id
      });
      return {
        status: 'booked',
        label: 'Booked',
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        description: 'Booked a call',
        affiliateCode: directAppointment.affiliateCode,
        appointmentId: directAppointment.id
      };
    }

    // FALLBACK: Try to match by email for appointments created before the fix
    const email = await getSessionEmail(sessionId);
    if (email) {
      const emailAppointment = await prisma.appointment.findFirst({
        where: {
          customerEmail: email.toLowerCase(), // Normalize for consistency
          quizSessionId: null // Only match appointments without direct session link
        },
        orderBy: { createdAt: 'desc' }
      });

      if (emailAppointment) {
        console.log('✅ Found appointment via email fallback:', {
          sessionId,
          email,
          appointmentId: emailAppointment.id
        });
        return {
          status: 'booked',
          label: 'Booked',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          description: 'Booked a call',
          affiliateCode: emailAppointment.affiliateCode,
          appointmentId: emailAppointment.id
        };
      }
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

    // PRIMARY: Get appointments directly linked to these sessions via quizSessionId
    const directAppointments = await prisma.appointment.findMany({
      where: {
        quizSessionId: { in: sessionIds }
      }
    });

    console.log('Found direct appointments:', directAppointments.length);

    // Group direct appointments by sessionId
    const appointmentsBySessionId = directAppointments.reduce((acc, appointment) => {
      if (appointment.quizSessionId) {
        acc[appointment.quizSessionId] = appointment;
      }
      return acc;
    }, {} as Record<string, any>);

    // FALLBACK: Get emails for sessions without direct appointments
    const sessionsNeedingEmailFallback = sessionIds.filter(id => !appointmentsBySessionId[id]);
    const sessionEmails: Record<string, string> = {};

    for (const sessionId of sessionsNeedingEmailFallback) {
      const email = await getSessionEmail(sessionId);
      if (email) {
        sessionEmails[sessionId] = email.toLowerCase(); // Normalize
      }
    }

    console.log('Sessions needing email fallback:', sessionsNeedingEmailFallback.length);

    // Get appointments for these emails (only those without quizSessionId)
    const emails = Object.values(sessionEmails);
    const emailAppointments = emails.length > 0 ? await prisma.appointment.findMany({
      where: {
        customerEmail: { in: emails },
        quizSessionId: null // Only match appointments without direct session link
      }
    }) : [];

    console.log('Found email fallback appointments:', emailAppointments.length);

    // Group email appointments by email
    const appointmentsByEmail = emailAppointments.reduce((acc, appointment) => {
      acc[appointment.customerEmail.toLowerCase()] = appointment;
      return acc;
    }, {} as Record<string, any>);

    // Determine status for each session
    const statuses: Record<string, LeadStatusInfo> = {};

    for (const sessionId of sessionIds) {
      // Check direct appointment first
      const directAppointment = appointmentsBySessionId[sessionId];

      if (directAppointment) {
        statuses[sessionId] = {
          status: 'booked',
          label: 'Booked',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          description: 'Booked a call',
          affiliateCode: directAppointment.affiliateCode,
          appointmentId: directAppointment.id
        };
        continue;
      }

      // Check email fallback
      const email = sessionEmails[sessionId];
      const emailAppointment = email ? appointmentsByEmail[email] : null;

      if (emailAppointment) {
        statuses[sessionId] = {
          status: 'booked',
          label: 'Booked',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          description: 'Booked a call',
          affiliateCode: emailAppointment.affiliateCode,
          appointmentId: emailAppointment.id
        };
        continue;
      }

      // No appointment found - completed only
      statuses[sessionId] = {
        status: 'completed',
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border border-green-200',
        description: 'Completed quiz with contact info',
        affiliateCode: null,
        appointmentId: null
      };
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
