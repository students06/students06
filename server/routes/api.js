const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Location = require('../models/Location');
const Subject = require('../models/Subject');
const { executeQuery } = require('../config/database');
const whatsappService = require('../services/whatsappService');

// إضافة middleware للتسجيل
router.use((req, res, next) => {
  console.log(`🔗 API Request: ${req.method} ${req.path}`);
  next();
});

// اختبار API
router.get('/test', (req, res) => {
  console.log('🧪 اختبار API');
  res.json({ 
    success: true, 
    message: 'API يعمل بشكل صحيح',
    timestamp: new Date().toISOString()
  });
});

// مصادقة المستخدم
router.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 محاولة تسجيل دخول:', req.body.username);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'اسم المستخدم وكلمة المرور مطلوبان' 
      });
    }
    
    const user = await User.findByUsername(username);
    console.log('👤 المستخدم الموجود:', user ? 'نعم' : 'لا');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم غير صحيح' });
    }
    
    const isValidPassword = await User.verifyPassword(password, user.password);
    console.log('🔑 كلمة المرور صحيحة:', isValidPassword ? 'نعم' : 'لا');
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
    
    // إزالة كلمة المرور من الاستجابة
    delete user.password;
    
    console.log('✅ تم تسجيل الدخول بنجاح للمستخدم:', user.name);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// إدارة المستخدمين
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userId = await User.create(req.body);
    res.json({ success: true, data: { id: userId } });
  } catch (error) {
    console.error('خطأ في إضافة المستخدم:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة المستخدم' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const success = await User.update(req.params.id, req.body);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المستخدم' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const success = await User.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف المستخدم' });
  }
});

// إدارة الطلاب
router.get('/students', async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('خطأ في جلب الطلاب:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/students', async (req, res) => {
  try {
    if (!req.body.barcode) {
      req.body.barcode = await Student.generateBarcode();
    }
    const studentId = await Student.create(req.body);
    res.json({ success: true, data: { id: studentId, barcode: req.body.barcode } });
  } catch (error) {
    console.error('خطأ في إضافة الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة الطالب' });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const success = await Student.update(req.params.id, req.body);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في تحديث الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الطالب' });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const success = await Student.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في حذف الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف الطالب' });
  }
});

router.put('/students/:id/transfer', async (req, res) => {
  try {
    const { newClassId } = req.body;
    const success = await Student.transferToClass(req.params.id, newClassId);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في نقل الطالب:', error);
    res.status(500).json({ success: false, message: 'خطأ في نقل الطالب' });
  }
});

router.get('/students/generate-barcode', async (req, res) => {
  try {
    const barcode = await Student.generateBarcode();
    res.json({ success: true, data: { barcode } });
  } catch (error) {
    console.error('خطأ في توليد الباركود:', error);
    res.status(500).json({ success: false, message: 'خطأ في توليد الباركود' });
  }
});

// إدارة الفصول
router.get('/classes', async (req, res) => {
  try {
    const query = `
      SELECT c.*, t.name as teacher_name, s.name as subject_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE c.is_active = TRUE
      ORDER BY c.name
    `;
    const classes = await executeQuery(query);
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('خطأ في جلب الفصول:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const { name, teacherId, maxCapacity } = req.body;
    const query = 'INSERT INTO classes (name, teacher_id, max_capacity) VALUES (?, ?, ?)';
    const result = await executeQuery(query, [name, teacherId, maxCapacity]);
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('خطأ في إضافة الفصل:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة الفصل' });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const { name, teacherId, maxCapacity } = req.body;
    const query = 'UPDATE classes SET name = ?, teacher_id = ?, max_capacity = ? WHERE id = ?';
    const result = await executeQuery(query, [name, teacherId, maxCapacity, req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في تحديث الفصل:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الفصل' });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    const query = 'UPDATE classes SET is_active = FALSE WHERE id = ?';
    const result = await executeQuery(query, [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في حذف الفصل:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف الفصل' });
  }
});

// إدارة المعلمين
router.get('/teachers', async (req, res) => {
  try {
    const query = `
      SELECT t.*, s.name as subject_name
      FROM teachers t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.is_active = TRUE
      ORDER BY t.name
    `;
    const teachers = await executeQuery(query);
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('خطأ في جلب المعلمين:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const { name, subjectId, phone, email } = req.body;
    const query = 'INSERT INTO teachers (name, subject_id, phone, email) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(query, [name, subjectId || null, phone || null, email || null]);
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('خطأ في إضافة المعلم:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة المعلم' });
  }
});

router.put('/teachers/:id', async (req, res) => {
  try {
    const { name, subjectId, phone, email } = req.body;
    const query = 'UPDATE teachers SET name = ?, subject_id = ?, phone = ?, email = ? WHERE id = ?';
    const result = await executeQuery(query, [name, subjectId || null, phone || null, email || null, req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في تحديث المعلم:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المعلم' });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    const query = 'UPDATE teachers SET is_active = FALSE WHERE id = ?';
    const result = await executeQuery(query, [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في حذف المعلم:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف المعلم' });
  }
});

// إدارة المواد
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.getAll();
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('خطأ في جلب المواد:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const subjectId = await Subject.create(req.body);
    res.json({ success: true, data: { id: subjectId } });
  } catch (error) {
    console.error('خطأ في إضافة المادة:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة المادة' });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const success = await Subject.update(req.params.id, req.body);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في تحديث المادة:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المادة' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    const success = await Subject.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في حذف المادة:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// إدارة الأماكن
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.getAll();
    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('خطأ في جلب الأماكن:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/locations', async (req, res) => {
  try {
    const locationId = await Location.create(req.body);
    res.json({ success: true, data: { id: locationId } });
  } catch (error) {
    console.error('خطأ في إضافة المكان:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة المكان' });
  }
});

router.put('/locations/:id', async (req, res) => {
  try {
    const success = await Location.update(req.params.id, req.body);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في تحديث المكان:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث المكان' });
  }
});

router.delete('/locations/:id', async (req, res) => {
  try {
    const success = await Location.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في حذف المكان:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// إدارة الجلسات
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.getAll();
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('خطأ في جلب الجلسات:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const sessionId = await Session.create(req.body);
    res.json({ success: true, data: { id: sessionId } });
  } catch (error) {
    console.error('خطأ في إضافة الجلسة:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة الجلسة' });
  }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const success = await Session.update(req.params.id, req.body);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في تحديث الجلسة:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الجلسة' });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const success = await Session.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('خطأ في حذف الجلسة:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف الجلسة' });
  }
});

router.put('/sessions/:id/toggle-status', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
    }

    let newStatus;
    if (session.status === 'active') {
      newStatus = 'completed';
    } else if (session.status === 'completed') {
      newStatus = 'active';
    } else {
      newStatus = 'active';
    }

    const success = await Session.update(req.params.id, { status: newStatus });
    res.json({ success, data: { newStatus } });
  } catch (error) {
    console.error('خطأ في تغيير حالة الجلسة:', error);
    res.status(500).json({ success: false, message: 'خطأ في تغيير حالة الجلسة' });
  }
});

// إدارة الحضور
router.get('/attendance', async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as student_name, se.start_time as session_start
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN sessions se ON a.session_id = se.id
      ORDER BY a.timestamp DESC
    `;
    const attendance = await executeQuery(query);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('خطأ في جلب الحضور:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const { student_id, session_id, status, notes } = req.body;
    
    // التحقق من وجود تسجيل سابق
    const existingQuery = 'SELECT id FROM attendance WHERE student_id = ? AND session_id = ?';
    const existing = await executeQuery(existingQuery, [student_id, session_id]);
    
    if (existing.length > 0) {
      // تحديث التسجيل الموجود
      const updateQuery = 'UPDATE attendance SET status = ?, notes = ?, timestamp = CURRENT_TIMESTAMP WHERE student_id = ? AND session_id = ?';
      await executeQuery(updateQuery, [status, notes || null, student_id, session_id]);
      res.json({ success: true, data: { id: existing[0].id } });
    } else {
      // إنشاء تسجيل جديد
      const insertQuery = 'INSERT INTO attendance (student_id, session_id, status, notes) VALUES (?, ?, ?, ?)';
      const result = await executeQuery(insertQuery, [student_id, session_id, status, notes || null]);
      res.json({ success: true, data: { id: result.insertId } });
    }
  } catch (error) {
    console.error('خطأ في تسجيل الحضور:', error);
    res.status(500).json({ success: false, message: 'خطأ في تسجيل الحضور' });
  }
});

router.put('/attendance/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const query = 'UPDATE attendance SET status = ?, notes = ? WHERE id = ?';
    const result = await executeQuery(query, [status, notes || null, req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في تحديث الحضور:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث الحضور' });
  }
});

router.delete('/attendance/:id', async (req, res) => {
  try {
    const query = 'DELETE FROM attendance WHERE id = ?';
    const result = await executeQuery(query, [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في حذف الحضور:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف الحضور' });
  }
});

// إدارة التقارير
router.get('/reports', async (req, res) => {
  try {
    const query = `
      SELECT r.*, s.name as student_name, se.start_time as session_start, c.name as class_name
      FROM reports r
      JOIN students s ON r.student_id = s.id
      JOIN sessions se ON r.session_id = se.id
      JOIN classes c ON se.class_id = c.id
      ORDER BY r.created_at DESC
    `;
    const reports = await executeQuery(query);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('خطأ في جلب التقارير:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const { studentId, sessionId, teacherRating, quizScore, participation, behavior, homework, comments, strengths, areasForImprovement } = req.body;
    
    // التحقق من وجود تقرير سابق
    const existingQuery = 'SELECT id FROM reports WHERE student_id = ? AND session_id = ?';
    const existing = await executeQuery(existingQuery, [studentId, sessionId]);
    
    if (existing.length > 0) {
      // تحديث التقرير الموجود
      const updateQuery = `
        UPDATE reports 
        SET teacher_rating = ?, quiz_score = ?, participation = ?, behavior = ?, homework = ?, 
            comments = ?, strengths = ?, areas_for_improvement = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE student_id = ? AND session_id = ?
      `;
      await executeQuery(updateQuery, [
        teacherRating, quizScore || null, participation, behavior, homework, 
        comments || null, strengths || null, areasForImprovement || null, studentId, sessionId
      ]);
      res.json({ success: true, data: { id: existing[0].id } });
    } else {
      // إنشاء تقرير جديد
      const insertQuery = `
        INSERT INTO reports (student_id, session_id, teacher_rating, quiz_score, participation, behavior, homework, comments, strengths, areas_for_improvement) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(insertQuery, [
        studentId, sessionId, teacherRating, quizScore || null, participation, behavior, homework, 
        comments || null, strengths || null, areasForImprovement || null
      ]);
      res.json({ success: true, data: { id: result.insertId } });
    }
  } catch (error) {
    console.error('خطأ في إضافة التقرير:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة التقرير' });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const { teacherRating, quizScore, participation, behavior, homework, comments, strengths, areasForImprovement } = req.body;
    const query = `
      UPDATE reports 
      SET teacher_rating = ?, quiz_score = ?, participation = ?, behavior = ?, homework = ?, 
          comments = ?, strengths = ?, areas_for_improvement = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const result = await executeQuery(query, [
      teacherRating, quizScore || null, participation, behavior, homework, 
      comments || null, strengths || null, areasForImprovement || null, req.params.id
    ]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في تحديث التقرير:', error);
    res.status(500).json({ success: false, message: 'خطأ في تحديث التقرير' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const query = 'DELETE FROM reports WHERE id = ?';
    const result = await executeQuery(query, [req.params.id]);
    res.json({ success: result.affectedRows > 0 });
  } catch (error) {
    console.error('خطأ في حذف التقرير:', error);
    res.status(500).json({ success: false, message: 'خطأ في حذف التقرير' });
  }
});

// تقارير الأداء والحضور
router.post('/reports/performance', async (req, res) => {
  try {
    const { startDate, endDate, classId, sessionId } = req.body;
    
    let query = `
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.barcode,
        c.name as class_name,
        se.id as session_id,
        se.start_time as session_date,
        r.teacher_rating,
        r.quiz_score,
        r.participation,
        r.behavior,
        r.homework,
        r.comments,
        r.strengths,
        r.areas_for_improvement
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN sessions se ON c.id = se.class_id
      LEFT JOIN reports r ON s.id = r.student_id AND se.id = r.session_id
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(se.start_time) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(se.start_time) <= ?';
      params.push(endDate);
    }
    
    if (classId) {
      query += ' AND c.id = ?';
      params.push(classId);
    }
    
    if (sessionId) {
      query += ' AND se.id = ?';
      params.push(sessionId);
    }
    
    query += ' ORDER BY s.name, se.start_time DESC';
    
    const reports = await executeQuery(query, params);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('خطأ في جلب تقرير الأداء:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب تقرير الأداء' });
  }
});

router.post('/reports/attendance', async (req, res) => {
  try {
    const { startDate, endDate, classId } = req.body;
    
    let query = `
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.barcode,
        c.name as class_name,
        COUNT(a.id) as total_sessions,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100, 2) as attendance_rate
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN attendance a ON s.id = a.student_id
      LEFT JOIN sessions se ON a.session_id = se.id
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND a.timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.timestamp <= ?';
      params.push(endDate);
    }
    
    if (classId) {
      query += ' AND s.class_id = ?';
      params.push(classId);
    }
    
    query += ' GROUP BY s.id, s.name, s.barcode, c.name ORDER BY s.name';
    
    const reports = await executeQuery(query, params);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('خطأ في جلب تقرير الحضور:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب تقرير الحضور' });
  }
});

// إدارة الواتساب
router.post('/whatsapp/initialize', async (req, res) => {
  try {
    const result = await whatsappService.initialize();
    res.json(result);
  } catch (error) {
    console.error('خطأ في تهيئة الواتساب:', error);
    res.status(500).json({ success: false, message: 'خطأ في تهيئة الواتساب' });
  }
});

router.get('/whatsapp/status', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      connected: whatsappService.getConnectionStatus(),
      qrCode: whatsappService.getQRCode()
    }
  });
});

router.post('/whatsapp/send-session-report', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await whatsappService.sendSessionReport(sessionId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('خطأ في إرسال تقرير الجلسة:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// الحصول على إحصائيات لوحة التحكم
router.get('/dashboard/stats', async (req, res) => {
  try {
    // إحصائيات عامة
    const totalStudents = await executeQuery('SELECT COUNT(*) as count FROM students WHERE is_active = TRUE');
    const totalSessions = await executeQuery('SELECT COUNT(*) as count FROM sessions');
    const totalClasses = await executeQuery('SELECT COUNT(*) as count FROM classes WHERE is_active = TRUE');
    
    // إحصائيات الحضور اليوم
    const todayAttendance = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
      FROM attendance 
      WHERE timestamp >= CURDATE() AND timestamp < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    `);
    
    const attendanceRate = todayAttendance[0].total > 0 
      ? (todayAttendance[0].present / todayAttendance[0].total) * 100 
      : 0;
    
    // الفصول منخفضة الحضور
    const lowAttendanceClasses = await executeQuery(`
      SELECT c.name 
      FROM classes c
      JOIN sessions s ON c.id = s.class_id
      JOIN attendance a ON s.id = a.session_id
      WHERE a.timestamp >= CURDATE() AND a.timestamp < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      GROUP BY c.id, c.name
      HAVING (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 < 70
    `);
    
    res.json({
      success: true,
      data: {
        totalStudents: totalStudents[0].count,
        totalSessions: totalSessions[0].count,
        totalClasses: totalClasses[0].count,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        todayPresent: todayAttendance[0].present || 0,
        todayAbsent: todayAttendance[0].absent || 0,
        lowAttendanceClasses: lowAttendanceClasses.map(c => c.name)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الإحصائيات' });
  }
});

module.exports = router;