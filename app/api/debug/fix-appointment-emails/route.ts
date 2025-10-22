import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Find appointments with "unknown@example.com" that should have real emails
    const unknownAppointments = await prisma.appointment.findMany({
      where: {
        customerEmail: "unknown@example.com"
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        createdAt: true
      }
    });

    console.log(`Found ${unknownAppointments.length} appointments with unknown@example.com`);

    let updatedCount = 0;
    const updates = [];

    for (const appointment of unknownAppointments) {
      // Try to find a quiz session with matching name and creation time
      const matchingSession = await prisma.quizSession.findFirst({
        where: {
          createdAt: {
            gte: new Date(appointment.createdAt.getTime() - 5 * 60 * 1000), // 5 minutes before
            lte: new Date(appointment.createdAt.getTime() + 5 * 60 * 1000)  // 5 minutes after
          }
        },
        include: {
          answers: {
            include: {
              question: true
            }
          }
        }
      });

      if (matchingSession) {
        // Find email in the session answers
        const emailAnswer = matchingSession.answers.find(a => 
          a.question?.prompt?.toLowerCase().includes('email') ||
          a.question?.type === 'email'
        );

        if (emailAnswer?.value) {
          const email = emailAnswer.value as string;
          
          // Update the appointment with the correct email
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { customerEmail: email }
          });

          updates.push({
            appointmentId: appointment.id,
            customerName: appointment.customerName,
            oldEmail: appointment.customerEmail,
            newEmail: email,
            sessionId: matchingSession.id
          });

          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedCount} appointments`,
      totalUnknown: unknownAppointments.length,
      updates: updates
    });
  } catch (error) {
    console.error("Error fixing appointment emails:", error);
    return NextResponse.json(
      { error: "Failed to fix appointment emails" },
      { status: 500 }
    );
  }
}

