import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdminAuth } from '@/lib/admin-auth-server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // First, let's check what's actually in the database
    const allConversions = await prisma.affiliateConversion.findMany({
      select: {
        id: true,
        conversionType: true,
        status: true,
        createdAt: true,
        referralCode: true
      }
    });

    console.log(`📊 Total conversions in database: ${allConversions.length}`);
    console.log('📊 Conversion types found:', allConversions.map(c => c.conversionType));

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

    // If no booking conversions found, let's try to import any conversions as bookings
    let conversionsToImport = existingBookings;
    if (existingBookings.length === 0 && allConversions.length > 0) {
      console.log('📊 No booking conversions found, importing all conversions as bookings');
      conversionsToImport = await prisma.affiliateConversion.findMany({
        where: {
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
      console.log(`📊 Found ${conversionsToImport.length} total conversions to import as bookings`);
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (const booking of conversionsToImport) {
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
      totalFound: conversionsToImport.length,
      totalConversionsInDB: allConversions.length,
      conversionTypes: allConversions.map(c => c.conversionType),
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
