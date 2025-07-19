const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم الملفات الثابتة
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.use('/api', apiRoutes);

// تقديم تطبيق React للمسارات الأخرى
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// بدء الخادم
async function startServer() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ فشل الاتصال بقاعدة البيانات. يرجى التحقق من الإعدادات.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
      console.log(`📱 يمكنك الوصول للنظام على: http://localhost:${PORT}`);
      console.log(`🔗 API متاح على: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ خطأ في بدء الخادم:', error);
    process.exit(1);
  }
}

startServer();

// معالجة الإغلاق الآمن
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الخادم...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 إيقاف الخادم...');
  process.exit(0);
});