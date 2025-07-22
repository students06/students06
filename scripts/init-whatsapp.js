const venom = require('venom-bot');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/whatsapp-config');

class WhatsAppInitializer {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCodeCount = 0;
    this.maxQRAttempts = 5;
  }

  async initialize() {
    try {
      console.log('🚀 بدء تهيئة الواتساب...');
      console.log(`📱 اسم الجلسة: ${config.session}`);
      console.log(`🗂️  مجلد التوكن: ${config.folderNameToken}`);
      
      // التأكد من وجود المجلدات
      await this.ensureDirectories();
      
      // تنظيف الجلسات القديمة إذا لزم الأمر
      await this.cleanOldSessions();
      
      this.client = await venom.create(
        config.session,
        this.onQRCode.bind(this),
        this.onStatusChange.bind(this),
        config
      );
      
      if (this.client) {
        console.log('✅ تم تهيئة الواتساب بنجاح!');
        await this.setupEventHandlers();
        await this.testConnection();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ خطأ في تهيئة الواتساب:', error);
      await this.handleError(error);
      return false;
    }
  }

  async ensureDirectories() {
    const dirs = [config.folderNameToken, './logs'];
    for (const dir of dirs) {
      await fs.ensureDir(dir);
      console.log(`📁 تم التأكد من وجود المجلد: ${dir}`);
    }
  }

  async cleanOldSessions() {
    const tokenPath = path.join(config.folderNameToken, config.session);
    if (await fs.pathExists(tokenPath)) {
      const stats = await fs.stat(tokenPath);
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceModified > 7) {
        console.log('🧹 تنظيف الجلسة القديمة...');
        await fs.remove(tokenPath);
      }
    }
  }

  onQRCode(base64Qr, asciiQR, attempts, urlCode) {
    this.qrCodeCount = attempts;
    console.log('\n📱 QR Code جديد - المحاولة:', attempts);
    console.log('🔗 URL Code:', urlCode);
    console.log('\n' + asciiQR + '\n');
    
    // حفظ QR Code كصورة
    this.saveQRCode(base64Qr, attempts);
    
    if (attempts >= this.maxQRAttempts) {
      console.log('⚠️  تم الوصول للحد الأقصى من محاولات QR Code');
      console.log('💡 نصيحة: تأكد من أن الواتساب مفتوح على هاتفك وجرب مرة أخرى');
    }
    
    console.log('\n📋 خطوات المسح:');
    console.log('1. افتح واتساب على هاتفك');
    console.log('2. اذهب إلى: الإعدادات > الأجهزة المرتبطة');
    console.log('3. اضغط على "ربط جهاز"');
    console.log('4. امسح QR Code أعلاه');
    console.log('5. انتظر رسالة التأكيد\n');
  }

  async saveQRCode(base64Qr, attempts) {
    try {
      const qrPath = path.join('./logs', `qr-code-${attempts}.png`);
      const base64Data = base64Qr.replace(/^data:image\/png;base64,/, '');
      await fs.writeFile(qrPath, base64Data, 'base64');
      console.log(`💾 تم حفظ QR Code في: ${qrPath}`);
    } catch (error) {
      console.error('❌ خطأ في حفظ QR Code:', error);
    }
  }

  onStatusChange(statusSession, session) {
    console.log('\n📊 تغيير حالة الجلسة:');
    console.log('🔄 الحالة:', statusSession);
    console.log('📱 الجلسة:', session);
    
    switch (statusSession) {
      case 'isLogged':
        this.isConnected = true;
        console.log('✅ تم تسجيل الدخول بنجاح!');
        break;
      case 'notLogged':
        this.isConnected = false;
        console.log('❌ لم يتم تسجيل الدخول');
        break;
      case 'browserClose':
        console.log('🔒 تم إغلاق المتصفح');
        break;
      case 'qrReadSuccess':
        console.log('✅ تم مسح QR Code بنجاح!');
        break;
      case 'qrReadFail':
        console.log('❌ فشل في مسح QR Code');
        break;
      default:
        console.log('ℹ️  حالة غير معروفة:', statusSession);
    }
  }

  async setupEventHandlers() {
    if (!this.client) return;

    // معالج الرسائل الواردة
    this.client.onMessage(async (message) => {
      console.log('📨 رسالة واردة:', message.from, message.body);
    });

    // معالج حالة الاتصال
    this.client.onStateChange((state) => {
      console.log('🔄 تغيير حالة الاتصال:', state);
    });

    // معالج قطع الاتصال
    this.client.onStreamChange((state) => {
      console.log('📡 تغيير حالة البث:', state);
    });
  }

  async testConnection() {
    try {
      console.log('\n🧪 اختبار الاتصال...');
      
      const hostDevice = await this.client.getHostDevice();
      console.log('📱 معلومات الجهاز:', hostDevice);
      
      const connectionState = await this.client.getConnectionState();
      console.log('🔗 حالة الاتصال:', connectionState);
      
      const batteryLevel = await this.client.getBatteryLevel();
      console.log('🔋 مستوى البطارية:', batteryLevel + '%');
      
      console.log('✅ اختبار الاتصال مكتمل!');
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
    }
  }

  async handleError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    const logPath = path.join('./logs', 'whatsapp-errors.json');
    let errors = [];
    
    try {
      if (await fs.pathExists(logPath)) {
        errors = await fs.readJson(logPath);
      }
    } catch (e) {
      console.error('خطأ في قراءة ملف الأخطاء:', e);
    }
    
    errors.push(errorLog);
    
    try {
      await fs.writeJson(logPath, errors, { spaces: 2 });
      console.log(`📝 تم تسجيل الخطأ في: ${logPath}`);
    } catch (e) {
      console.error('خطأ في كتابة ملف الأخطاء:', e);
    }
  }
}

// تشغيل التهيئة
async function main() {
  const initializer = new WhatsAppInitializer();
  const success = await initializer.initialize();
  
  if (success) {
    console.log('\n🎉 تم تهيئة الواتساب بنجاح!');
    console.log('💡 يمكنك الآن استخدام النظام لإرسال الرسائل');
  } else {
    console.log('\n❌ فشل في تهيئة الواتساب');
    console.log('💡 راجع الأخطاء أعلاه وحاول مرة أخرى');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = WhatsAppInitializer;