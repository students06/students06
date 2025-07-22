# دليل إعداد قاعدة البيانات - النسخة المصححة

## 🎯 الهدف
هذا الدليل يوضح كيفية إعداد قاعدة البيانات MySQL/MariaDB لنظام إدارة الحضور الشامل بشكل صحيح ومضمون.

## 📋 المتطلبات الأساسية

### 1. تثبيت XAMPP
- حمّل XAMPP من الموقع الرسمي: https://www.apachefriends.org/
- ثبّت XAMPP واتبع التعليمات
- تأكد من تشغيل Apache و MySQL

### 2. التحقق من تشغيل الخدمات
```bash
# في XAMPP Control Panel
✅ Apache: Running
✅ MySQL: Running
```

## 🗄️ إعداد قاعدة البيانات

### الخطوة 1: الوصول إلى phpMyAdmin
1. افتح المتصفح واذهب إلى: `http://localhost/phpmyadmin`
2. سجل الدخول (عادة بدون كلمة مرور للمستخدم root)

### الخطوة 2: حذف قاعدة البيانات القديمة (إن وجدت)
```sql
-- في phpMyAdmin، نفذ هذا الاستعلام
DROP DATABASE IF EXISTS attendance_system;
```

### الخطوة 3: استيراد قاعدة البيانات الجديدة
1. في phpMyAdmin، اضغط على تبويب "Import"
2. اختر ملف `database/attendance_system_mysql_fixed.sql`
3. تأكد من أن Character set هو `utf8mb4`
4. اضغط "Go" لتنفيذ الاستيراد

### الخطوة 4: التحقق من نجاح الاستيراد
```sql
-- تحقق من وجود الجداول
USE attendance_system;
SHOW TABLES;

-- يجب أن ترى هذه الجداول:
-- attendance
-- classes  
-- locations
-- reports
-- sessions
-- students
-- subjects
-- system_settings
-- teachers
-- users
-- whatsapp_logs
```

### الخطوة 5: التحقق من البيانات التجريبية
```sql
-- تحقق من المستخدمين
SELECT username, name, role FROM users;

-- تحقق من الطلاب
SELECT name, barcode, class_id FROM students LIMIT 5;

-- تحقق من الفصول
SELECT name, teacher_id, subject_id FROM classes LIMIT 5;
```

## ⚙️ إعداد ملف البيئة

### إنشاء ملف .env
```bash
# انسخ ملف المثال
cp .env.example .env
```

### تحرير ملف .env
```env
# إعدادات قاعدة البيانات
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendance_system

# إعدادات الخادم
PORT=3001
VITE_API_URL=http://localhost:3001/api

# إعدادات الأمان
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
```

## 🚀 تشغيل النظام

### الخطوة 1: تثبيت المكتبات
```bash
npm install
```

### الخطوة 2: تشغيل النظام
```bash
# تشغيل النظام كاملاً (الخادم الخلفي والواجهة الأمامية)
npm run dev:full

# أو تشغيل كل جزء منفصلاً
# الخادم الخلفي
npm run dev:server

# الواجهة الأمامية (في terminal آخر)
npm run dev
```

## 🔐 بيانات الدخول الافتراضية

### المدير العام
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`
- **الصلاحيات:** جميع الصلاحيات

### المشرف الأول
- **اسم المستخدم:** `supervisor1`
- **كلمة المرور:** `admin123`
- **الصلاحيات:** إدارة الطلاب والفصول والجلسات والحضور والتقارير

### المشرف الثاني
- **اسم المستخدم:** `supervisor2`
- **كلمة المرور:** `admin123`
- **الصلاحيات:** إدارة الطلاب والحضور فقط

## 🔧 استكشاف الأخطاء وإصلاحها

### مشكلة: خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من تشغيل MySQL
# في XAMPP Control Panel، تأكد من أن MySQL يعمل

# تحقق من إعدادات الاتصال في .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendance_system
```

### مشكلة: خطأ 404 في API
```bash
# تأكد من تشغيل الخادم الخلفي
npm run dev:server

# تحقق من URL في .env
VITE_API_URL=http://localhost:3001/api
```

### مشكلة: خطأ في تسجيل الدخول
```sql
-- تحقق من وجود المستخدمين في قاعدة البيانات
SELECT * FROM users WHERE username = 'admin';

-- إذا لم توجد، أعد استيراد قاعدة البيانات
```

### مشكلة: التواريخ تظهر كـ "Invalid Date"
- هذه المشكلة تم حلها في النسخة المصححة
- تأكد من استخدام ملف `database/attendance_system_mysql_fixed.sql`

### مشكلة: خطأ في SQL syntax مع timestamp
- تم إصلاح هذه المشكلة في النسخة الجديدة
- تم تغيير `timestamp` إلى `attendance_time` لتجنب الكلمات المحجوزة
- استخدم الملف المصحح `database/attendance_system_mysql_fixed.sql`

## ✅ التحقق من نجاح الإعداد

### 1. اختبار الاتصال بقاعدة البيانات
- افتح `http://localhost:3001/api/test`
- يجب أن ترى رسالة نجاح

### 2. اختبار تسجيل الدخول
- افتح `http://localhost:5173`
- استخدم `admin` / `admin123`
- يجب أن تدخل إلى لوحة التحكم

### 3. اختبار العمليات الأساسية
- جرب إضافة طالب جديد
- جرب إضافة فصل جديد
- جرب تسجيل حضور

## 📞 الدعم الفني

إذا واجهت أي مشاكل:

1. **تحقق من سجلات الأخطاء:**
   - في المتصفح: F12 → Console
   - في الخادم: راجع رسائل npm run dev:server

2. **تحقق من قاعدة البيانات:**
   - تأكد من استيراد الملف الصحيح
   - تحقق من وجود البيانات التجريبية

3. **إعادة الإعداد الكامل:**
   ```bash
   # احذف قاعدة البيانات وأعد إنشاءها
   # أعد استيراد database/attendance_system_clean.sql
   # أعد تشغيل النظام
   npm run dev:full
   ```

---

**ملاحظة مهمة:** استخدم دائماً ملف `database/attendance_system_mysql_fixed.sql` الجديد، فهو مصحح ومتوافق 100% مع MySQL/MariaDB ولا يحتوي على أي كلمات محجوزة.