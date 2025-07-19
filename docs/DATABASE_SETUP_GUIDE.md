# 🗄️ دليل إعداد قاعدة البيانات - نظام إدارة الحضور

## 📋 المتطلبات الأساسية

### البرامج المطلوبة:
- **XAMPP** (أو WAMP/MAMP) - يحتوي على Apache و MySQL
- **phpMyAdmin** (مدمج مع XAMPP)
- **Node.js** (الإصدار 16 أو أحدث)

## 🚀 خطوات الإعداد

### الخطوة 1: تشغيل XAMPP

1. **افتح XAMPP Control Panel**
2. **شغّل الخدمات التالية:**
   - ✅ **Apache** (للخادم المحلي)
   - ✅ **MySQL** (لقاعدة البيانات)
3. **تأكد من ظهور اللون الأخضر** بجانب كل خدمة

### الخطوة 2: إنشاء قاعدة البيانات

#### الطريقة الأولى: استخدام phpMyAdmin (الأسهل)

1. **افتح المتصفح واذهب إلى:**
   ```
   http://localhost/phpmyadmin
   ```

2. **إنشاء قاعدة البيانات:**
   - اضغط على **"New"** في الشريط الجانبي
   - اكتب اسم قاعدة البيانات: `attendance_system`
   - اختر **Collation**: `utf8mb4_unicode_ci`
   - اضغط **"Create"**

3. **استيراد هيكل قاعدة البيانات:**
   - اختر قاعدة البيانات `attendance_system`
   - اضغط على تبويب **"Import"**
   - اضغط **"Choose File"** واختر ملف `database/attendance_system_updated.sql`
   - اضغط **"Go"**
   - انتظر حتى تظهر رسالة النجاح ✅

#### الطريقة الثانية: استخدام سطر الأوامر

```bash
# الدخول إلى MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# الخروج من MySQL
exit

# استيراد الملف
mysql -u root -p attendance_system < database/attendance_system_updated.sql
```

### الخطوة 3: إعداد ملف البيئة

1. **انسخ ملف `.env.example` إلى `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **عدّل إعدادات قاعدة البيانات في `.env`:**
   ```env
   # إعدادات قاعدة البيانات
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=attendance_system
   
   # إعدادات الخادم
   PORT=3001
   NODE_ENV=development
   VITE_API_URL=http://localhost:3001/api
   ```

   **ملاحظة:** إذا كان لديك كلمة مرور لـ MySQL، ضعها في `DB_PASSWORD`

### الخطوة 4: تثبيت المكتبات

```bash
# تثبيت مكتبات Node.js
npm install

# تثبيت مكتبات إضافية إذا لزم الأمر
npm install mysql2 bcryptjs cors express dotenv
```

### الخطوة 5: اختبار الاتصال

```bash
# تشغيل الخادم الخلفي
npm run dev:server
```

**يجب أن تظهر الرسائل التالية:**
```
✅ تم الاتصال بقاعدة البيانات بنجاح
🚀 الخادم يعمل على المنفذ 3001
📱 يمكنك الوصول للنظام على: http://localhost:3001
🔗 API متاح على: http://localhost:3001/api
```

### الخطوة 6: تشغيل النظام الكامل

```bash
# في terminal منفصل، شغّل الواجهة الأمامية
npm run dev

# أو شغّل النظام كاملاً في terminal واحد
npm run dev:full
```

## 🔧 استكشاف الأخطاء وحلها

### مشكلة: خطأ في الاتصال بقاعدة البيانات

**الأعراض:**
```
❌ خطأ في الاتصال بقاعدة البيانات: Access denied for user 'root'@'localhost'
```

**الحلول:**

1. **تحقق من تشغيل MySQL في XAMPP**
2. **تحقق من إعدادات `.env`:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=    # اتركها فارغة إذا لم تضع كلمة مرور
   ```
3. **إعادة تشغيل MySQL من XAMPP**
4. **إذا كان لديك كلمة مرور، ضعها في `.env`**

### مشكلة: قاعدة البيانات غير موجودة

**الأعراض:**
```
❌ Unknown database 'attendance_system'
```

**الحل:**
```sql
-- في phpMyAdmin أو MySQL command line
CREATE DATABASE attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### مشكلة: المنفذ مستخدم

**الأعراض:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**الحلول:**

1. **تغيير المنفذ في `.env`:**
   ```env
   PORT=3002
   VITE_API_URL=http://localhost:3002/api
   ```

2. **أو إيقاف العملية المستخدمة للمنفذ:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID [PID_NUMBER] /F
   
   # Linux/Mac
   lsof -ti:3001 | xargs kill -9
   ```

### مشكلة: خطأ في استيراد قاعدة البيانات

**الحل:**
1. **تأكد من وجود ملف `database/attendance_system_updated.sql`**
2. **تحقق من صحة ملف SQL**
3. **جرب استيراد الملف يدوياً في phpMyAdmin**

## 🔐 بيانات الدخول الافتراضية

بعد إعداد قاعدة البيانات، يمكنك استخدام البيانات التالية:

### المدير العام:
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`

### المشرف الأول:
- **اسم المستخدم:** `supervisor1`
- **كلمة المرور:** `super123`

### المشرف الثاني:
- **اسم المستخدم:** `supervisor2`
- **كلمة المرور:** `super123`

## 📊 التحقق من البيانات

بعد الإعداد، تحقق من وجود البيانات التجريبية:

1. **الطلاب:** 15 طالب
2. **الفصول:** 10 فصول
3. **المعلمين:** 10 معلمين
4. **المواد:** 10 مواد
5. **الأماكن:** 8 أماكن
6. **الجلسات:** 7 جلسات تجريبية
7. **سجلات الحضور:** 15 سجل
8. **التقارير:** 8 تقارير

## 🔄 تحديث قاعدة البيانات

إذا احتجت لتحديث قاعدة البيانات لاحقاً:

### إضافة جداول جديدة:
```sql
-- مثال: إضافة جدول جديد
ALTER TABLE students ADD COLUMN new_field VARCHAR(100);
```

### نسخ احتياطي:
```bash
# إنشاء نسخة احتياطية
mysqldump -u root -p attendance_system > backup_$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
mysql -u root -p attendance_system < backup_20240119.sql
```

## 🛡️ الأمان

### نصائح الأمان:
1. **غيّر كلمات المرور الافتراضية**
2. **فعّل كلمة مرور لـ MySQL في XAMPP**
3. **لا تشغّل XAMPP على شبكة عامة**
4. **أنشئ نسخ احتياطية دورية**

### إعداد كلمة مرور لـ MySQL:
```sql
-- في phpMyAdmin
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
```

ثم حدّث ملف `.env`:
```env
DB_PASSWORD=your_new_password
```

## ✅ قائمة التحقق النهائية

- [ ] XAMPP مثبت ويعمل
- [ ] MySQL و Apache يعملان (أخضر في XAMPP)
- [ ] قاعدة البيانات `attendance_system` تم إنشاؤها
- [ ] ملف SQL تم استيراده بنجاح
- [ ] ملف `.env` تم إنشاؤه وتعديله
- [ ] المكتبات تم تثبيتها (`npm install`)
- [ ] الخادم الخلفي يعمل (`npm run dev:server`)
- [ ] رسالة "تم الاتصال بقاعدة البيانات بنجاح" تظهر
- [ ] الواجهة الأمامية تعمل (`npm run dev`)
- [ ] يمكن الوصول للنظام على `http://localhost:3001`
- [ ] تسجيل الدخول يعمل بالبيانات الافتراضية

## 📞 الدعم الفني

في حالة مواجهة مشاكل:

1. **تحقق من سجلات الأخطاء:**
   - وحدة التحكم في المتصفح (F12)
   - Terminal حيث يعمل الخادم
   - سجلات XAMPP

2. **تحقق من الاتصالات:**
   - قاعدة البيانات: `http://localhost/phpmyadmin`
   - API: `http://localhost:3001/api/dashboard/stats`
   - النظام: `http://localhost:3001`

3. **إعادة تشغيل الخدمات:**
   - أعد تشغيل MySQL في XAMPP
   - أعد تشغيل الخادم: `npm run dev:server`

---

## 🎉 تهانينا!

إذا اتبعت جميع الخطوات بنجاح، فأنت الآن تملك نظام إدارة حضور متكامل يعمل بقاعدة بيانات MySQL! 

**الخطوات التالية:**
1. اختبر جميع الميزات
2. أضف بيانات حقيقية
3. اختبر الواتساب (اختياري)
4. أنشئ نسخ احتياطية دورية

**استمتع بالنظام! 🚀✨**