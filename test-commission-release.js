// Quick test script to release commissions immediately
// Run this with: node test-commission-release.js

const BASE_URL = 'https://joinbrightnest.com'; // Change to localhost:3000 if testing locally

async function testCommissionRelease() {
  console.log('🧪 Testing Commission Release...\n');
  
  try {
    // Call the auto-release endpoint
    console.log('📞 Calling auto-release endpoint...');
    const response = await fetch(`${BASE_URL}/api/auto-release-commissions`);
    const data = await response.json();
    
    console.log('\n✅ Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.releasedCount > 0) {
      console.log(`\n🎉 SUCCESS! Released ${data.releasedCount} commissions totaling $${data.releasedAmount}`);
    } else {
      console.log('\n⏳ No commissions ready for release yet.');
      console.log(`Hold period: ${data.holdDays} days`);
      console.log(`Cutoff date: ${data.cutoffDate}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCommissionRelease();

