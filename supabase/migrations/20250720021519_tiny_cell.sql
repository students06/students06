@@ .. @@
 -- إدراج المستخدمين الافتراضيين (كلمة المرور: admin123)
 INSERT INTO users (username, password, name, role, permissions) VALUES
-('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المدير العام', 'admin', 
+('admin', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDDNOPEXY0tCXxMrahZyHgSSO', 'المدير العام', 'admin', 
  '{"students": true, "classes": true, "teachers": true, "sessions": true, "attendance": true, "reports": true, "whatsapp": true, "users": true}'),
-('supervisor1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المشرف الأول', 'supervisor', 
+('supervisor1', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDDNOPEXY0tCXxMrahZyHgSSO', 'المشرف الأول', 'supervisor', 
  '{"students": true, "classes": true, "teachers": false, "sessions": true, "attendance": true, "reports": true, "whatsapp": false, "users": false}'),
-('supervisor2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المشرف الثاني', 'supervisor', 
+('supervisor2', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDDNOPEXY0tCXxMrahZyHgSSO', 'المشرف الثاني', 'supervisor', 
  '{"students": true, "classes": false, "teachers": false, "sessions": false, "attendance": true, "reports": false, "whatsapp": false, "users": false}');