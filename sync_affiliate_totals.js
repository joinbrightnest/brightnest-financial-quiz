import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncAffiliateTotals() {
  console.log('🔄 Starting affiliate totals synchronization...');
  
  try {
    // Get all affiliates
    const affiliates = await prisma.affiliate.findMany();
    console.log(`Found ${affiliates.length} affiliates to sync`);
    
    for (const affiliate of affiliates) {
      console.log(`\n📊 Syncing affiliate: ${affiliate.name} (${affiliate.referralCode})`);
      
      // Get actual counts from related tables
      const [clicks, conversions, bookings, sales] = await Promise.all([
        prisma.affiliateClick.count({
          where: { affiliateId: affiliate.id }
        }),
        prisma.affiliateConversion.count({
          where: { 
            affiliateId: affiliate.id,
            conversionType: 'quiz_completion',
            status: 'confirmed'
          }
        }),
        prisma.affiliateConversion.count({
          where: { 
            affiliateId: affiliate.id,
            conversionType: 'booking',
            status: 'confirmed'
          }
        }),
        prisma.affiliateConversion.count({
          where: { 
            affiliateId: affiliate.id,
            conversionType: 'sale',
            status: 'confirmed'
          }
        })
      ]);
      
      // Calculate total commission
      const commissionResult = await prisma.affiliateConversion.aggregate({
        where: { 
          affiliateId: affiliate.id,
          status: 'confirmed'
        },
        _sum: {
          commissionAmount: true
        }
      });
      
      const totalCommission = commissionResult._sum.commissionAmount || 0;
      
      console.log(`  Current DB values: Clicks=${affiliate.totalClicks}, Leads=${affiliate.totalLeads}, Bookings=${affiliate.totalBookings}, Sales=${affiliate.totalSales}`);
      console.log(`  Actual counts:     Clicks=${clicks}, Leads=${conversions}, Bookings=${bookings}, Sales=${sales}`);
      
      // Update affiliate record with correct totals
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalClicks: clicks,
          totalLeads: conversions,
          totalBookings: bookings,
          totalSales: sales,
          totalCommission: totalCommission
        }
      });
      
      console.log(`  ✅ Updated affiliate totals`);
    }
    
    console.log('\n🎉 Affiliate totals synchronization completed!');
    
  } catch (error) {
    console.error('❌ Error syncing affiliate totals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAffiliateTotals();
