import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get all existing booking conversions that haven't been imported yet
    const existingBookings = await prisma.affiliateConversion.findMany({
      where: {
        conversionType: 'booking',
        status: 'confirmed'
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            referralCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${existingBookings.length} existing booking conversions to import`);

    let importedCount = 0;
    const errors: string[] = [];

    for (const booking of existingBookings) {
      try {
        // Check if this booking has already been imported
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            calendlyEventId: `imported-${booking.id}`
          }
        });

        if (existingAppointment) {
          console.log(`⏭️ Booking ${booking.id} already imported, skipping`);
          continue;
        }

        // Create appointment from booking conversion
        const appointment = await prisma.appointment.create({
          data: {
            calendlyEventId: `imported-${booking.id}`,
            customerName: `Customer ${booking.id.slice(-6)}`, // Generate placeholder name
            customerEmail: `customer-${booking.id.slice(-6)}@example.com`, // Generate placeholder email
            customerPhone: null,
            scheduledAt: booking.createdAt, // Use booking creation time as scheduled time
            duration: 30,
            status: 'scheduled',
            affiliateCode: booking.referralCode,
            utmSource: null,
            utmMedium: null,
            utmCampaign: null,
          }
        });

        console.log(`✅ Imported booking ${booking.id} as appointment ${appointment.id}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error importing booking ${booking.id}:`, error);
        errors.push(`Failed to import booking ${booking.id}: ${error}`);
      }
    }

    console.log(`🎉 Import completed: ${importedCount} bookings imported, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      importedCount,
      totalFound: existingBookings.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Error importing bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
