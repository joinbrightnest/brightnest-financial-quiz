const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres:0740610212sS.@db.muotyvhquvcawwyjvjob.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT COUNT(*) FROM "QuizQuestion"');
    console.log('✅ Quiz questions count:', result.rows[0].count);
    
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();

