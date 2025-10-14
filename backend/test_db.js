// test_db.js - Test PostgreSQL Connection
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password@123',  // ✅ Fixed line
  database: process.env.DB_NAME || 'HospitalManagement',
});

async function testConnection() {
  console.log('\n🔍 Testing PostgreSQL Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST || 'localhost');
  console.log('  Port:', process.env.DB_PORT || 5432);
  console.log('  User:', process.env.DB_USER || 'postgres');
  console.log('  Database:', process.env.DB_NAME || 'HospitalManagement');
  console.log('');

  try {
    // Test 1: Basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('   Server time:', result.rows[0].now);

    // Test 2: Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n✅ Found', tables.rows.length, 'tables:');
    tables.rows.forEach(row => {
      console.log('   -', row.table_name);
    });

    // Test 3: Check Admin table
    const adminCheck = await pool.query('SELECT COUNT(*) FROM Admin');
    console.log('\n✅ Admin table accessible');
    console.log('   Admin accounts:', adminCheck.rows[0].count);

    // Test 4: Check database version
    const version = await pool.query('SELECT version()');
    console.log('\n✅ PostgreSQL version:');
    console.log('  ', version.rows[0].version.split(',')[0]);

    console.log('\n🎉 All tests passed!\n');

  } catch (err) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', err.message);
    console.error('\nPossible issues:');
    console.error('1. PostgreSQL is not running');
    console.error('2. Wrong password in .env');
    console.error('3. Database "HospitalManagement" does not exist');
    console.error('4. User does not have access permissions');
    console.error('\nFull error:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

testConnection();
