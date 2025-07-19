const mysql = require('mysql2/promise');
require('dotenv').config();

// إعدادات قاعدة البيانات
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_system',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// إنشاء pool للاتصالات
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// اختبار الاتصال
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    return false;
  }
}

// دالة تنفيذ الاستعلامات
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('خطأ في تنفيذ الاستعلام:', error);
    throw error;
  }
}

// دالة تنفيذ المعاملات
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  executeQuery,
  executeTransaction,
  testConnection
};