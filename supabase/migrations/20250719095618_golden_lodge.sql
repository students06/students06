-- قاعدة بيانات نظام إدارة الحضور الشامل
-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_system;

-- جدول المستخدمين
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'supervisor', 'teacher') NOT NULL DEFAULT 'supervisor',
    permissions JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- جدول المواد الدراسية
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- جدول أماكن الحصص
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20),
    capacity INT DEFAULT 30,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- جدول المعلمين
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject_id INT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- جدول الفصول
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_id INT,
    subject_id INT,
    max_capacity INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- جدول الطلاب
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(20) UNIQUE NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    class_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- جدول الجلسات
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    location_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- جدول الحضور
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    is_automatic BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, session_id)
);

-- جدول التقارير
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    teacher_rating INT CHECK (teacher_rating >= 1 AND teacher_rating <= 5),
    quiz_score DECIMAL(5,2) DEFAULT NULL,
    participation INT CHECK (participation >= 1 AND participation <= 5),
    behavior VARCHAR(50) DEFAULT 'ممتاز',
    homework ENUM('completed', 'incomplete') DEFAULT 'completed',
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_report (student_id, session_id)
);

-- جدول سجل رسائل الواتساب
CREATE TABLE whatsapp_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT,
    message_type ENUM('absence', 'performance', 'reminder', 'announcement', 'session_report') NOT NULL,
    message TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('sent', 'failed', 'delivered', 'read') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- جدول إعدادات النظام
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إدراج البيانات الأساسية

-- إدراج المستخدمين الافتراضيين
INSERT INTO users (username, password, name, role, permissions) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المدير العام', 'admin', '{"all": true}'),
('supervisor1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المشرف الأول', 'supervisor', '{"students": true, "classes": true, "sessions": true, "attendance": true, "reports": true}'),
('supervisor2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المشرف الثاني', 'supervisor', '{"students": true, "attendance": true, "reports": true}');

-- إدراج المواد الدراسية
INSERT INTO subjects (name, description) VALUES
('الرياضيات', 'مادة الرياضيات للمراحل المختلفة'),
('العلوم', 'مادة العلوم الطبيعية'),
('اللغة العربية', 'مادة اللغة العربية والنحو'),
('اللغة الإنجليزية', 'مادة اللغة الإنجليزية'),
('الفيزياء', 'مادة الفيزياء للمرحلة الثانوية'),
('الكيمياء', 'مادة الكيمياء للمرحلة الثانوية'),
('الأحياء', 'مادة الأحياء للمرحلة الثانوية'),
('التاريخ', 'مادة التاريخ والجغرافيا'),
('الحاسوب', 'مادة علوم الحاسوب والبرمجة');

-- إدراج أماكن الحصص
INSERT INTO locations (name, room_number, capacity) VALUES
('سنتر التفوق', 'A101', 30),
('سنتر المجد', 'B201', 25),
('سنتر النجاح', 'C301', 35),
('القاعة الرئيسية', 'MAIN', 50),
('المختبر العلمي', 'LAB1', 20),
('قاعة الحاسوب', 'COMP1', 25);

-- إدراج المعلمين
INSERT INTO teachers (name, subject_id, phone) VALUES
('أحمد محمد علي', 1, '966501234567'),
('فاطمة عبدالله', 2, '966501234568'),
('محمد حسن', 3, '966501234569'),
('نورا سالم', 4, '966501234570'),
('خالد أحمد', 5, '966501234571'),
('سارة محمود', 6, '966501234572');

-- إدراج الفصول
INSERT INTO classes (name, teacher_id, subject_id, max_capacity) VALUES
('الصف الأول أ - رياضيات', 1, 1, 30),
('الصف الثاني ب - علوم', 2, 2, 25),
('الصف الثالث ج - عربي', 3, 3, 28),
('الصف الأول ب - إنجليزي', 4, 4, 30),
('الثانوي - فيزياء', 5, 5, 20),
('الثانوي - كيمياء', 6, 6, 22);

-- إدراج الطلاب
INSERT INTO students (name, barcode, parent_phone, class_id) VALUES
('أحمد محمد علي', 'STUD000001', '966501234567', 1),
('فاطمة عبدالله', 'STUD000002', '966501234568', 1),
('محمد خالد', 'STUD000003', '966501234569', 2),
('نور حسن', 'STUD000004', '966501234570', 2),
('عبدالرحمن سعد', 'STUD000005', '966501234571', 3),
('سارة أحمد', 'STUD000006', '966501234572', 3),
('علي محمود', 'STUD000007', '966501234573', 4),
('مريم خالد', 'STUD000008', '966501234574', 4),
('يوسف عبدالله', 'STUD000009', '966501234575', 5),
('زينب محمد', 'STUD000010', '966501234576', 5);

-- إدراج جلسات تجريبية
INSERT INTO sessions (class_id, location_id, start_time, end_time, status) VALUES
(1, 1, '2024-01-15 09:00:00', '2024-01-15 10:30:00', 'completed'),
(2, 2, '2024-01-15 11:00:00', '2024-01-15 12:30:00', 'completed'),
(3, 3, '2024-01-15 14:00:00', '2024-01-15 15:30:00', 'active'),
(4, 4, '2024-01-16 09:00:00', '2024-01-16 10:30:00', 'scheduled'),
(5, 5, '2024-01-16 11:00:00', '2024-01-16 12:30:00', 'scheduled');

-- إدراج سجلات حضور تجريبية
INSERT INTO attendance (student_id, session_id, status) VALUES
(1, 1, 'present'),
(2, 1, 'present'),
(3, 2, 'present'),
(4, 2, 'absent'),
(5, 3, 'present'),
(6, 3, 'late');

-- إدراج تقارير تجريبية
INSERT INTO reports (student_id, session_id, teacher_rating, quiz_score, participation, behavior, homework, comments) VALUES
(1, 1, 5, 95.5, 5, 'ممتاز', 'completed', 'طالب متميز ومتفاعل'),
(2, 1, 4, 87.0, 4, 'جيد جداً', 'completed', 'أداء جيد يحتاج تحسين بسيط'),
(3, 2, 5, 92.0, 5, 'ممتاز', 'completed', 'مشاركة فعالة وفهم ممتاز'),
(5, 3, 4, 88.5, 4, 'جيد', 'completed', 'يحتاج المزيد من التركيز');

-- إدراج إعدادات النظام
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('whatsapp_enabled', 'true', 'تفعيل خدمة الواتساب'),
('default_session_duration', '90', 'مدة الجلسة الافتراضية بالدقائق'),
('attendance_grace_period', '15', 'فترة السماح للحضور بالدقائق'),
('barcode_prefix', 'STUD', 'بادئة رمز الطالب'),
('system_name', 'نظام إدارة الحضور الشامل', 'اسم النظام'),
('admin_email', 'admin@attendance.local', 'بريد المدير الإلكتروني');

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX idx_students_barcode ON students(barcode);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_timestamp ON attendance(timestamp);
CREATE INDEX idx_sessions_class ON sessions(class_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_reports_student ON reports(student_id);
CREATE INDEX idx_reports_session ON reports(session_id);
CREATE INDEX idx_whatsapp_logs_student ON whatsapp_logs(student_id);
CREATE INDEX idx_whatsapp_logs_sent_at ON whatsapp_logs(sent_at);

-- إنشاء Views مفيدة
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id,
    s.name,
    s.barcode,
    c.name as class_name,
    COUNT(a.id) as total_sessions,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
    ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_rate
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, s.barcode, c.name;

CREATE VIEW session_attendance_summary AS
SELECT 
    se.id,
    c.name as class_name,
    t.name as teacher_name,
    sub.name as subject_name,
    l.name as location_name,
    se.start_time,
    se.end_time,
    se.status,
    COUNT(a.id) as total_students,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_rate
FROM sessions se
JOIN classes c ON se.class_id = c.id
LEFT JOIN teachers t ON c.teacher_id = t.id
LEFT JOIN subjects sub ON c.subject_id = sub.id
LEFT JOIN locations l ON se.location_id = l.id
LEFT JOIN attendance a ON se.id = a.session_id
GROUP BY se.id, c.name, t.name, sub.name, l.name, se.start_time, se.end_time, se.status;

-- إنشاء Stored Procedures مفيدة
DELIMITER //

CREATE PROCEDURE GetStudentAttendanceReport(
    IN student_id INT,
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        s.name as student_name,
        c.name as class_name,
        se.start_time,
        a.status,
        a.notes,
        r.teacher_rating,
        r.participation,
        r.homework
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN sessions se ON a.session_id = se.id
    JOIN classes c ON se.class_id = c.id
    LEFT JOIN reports r ON a.student_id = r.student_id AND a.session_id = r.session_id
    WHERE a.student_id = student_id
    AND DATE(se.start_time) BETWEEN start_date AND end_date
    ORDER BY se.start_time DESC;
END //

CREATE PROCEDURE GetClassAttendanceReport(
    IN class_id INT,
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        s.name as student_name,
        s.barcode,
        COUNT(a.id) as total_sessions,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_rate
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id
    LEFT JOIN sessions se ON a.session_id = se.id
    WHERE s.class_id = class_id
    AND (start_date IS NULL OR DATE(se.start_time) >= start_date)
    AND (end_date IS NULL OR DATE(se.start_time) <= end_date)
    GROUP BY s.id, s.name, s.barcode
    ORDER BY s.name;
END //

DELIMITER ;