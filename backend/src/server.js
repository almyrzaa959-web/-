// ==========================================
// TITO - الخادم الخلفي
// ==========================================

// استيراد المكتبات
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// تحميل إعدادات البيئة
dotenv.config();

// إنشاء تطبيق الخادم
const app = express();

// رقم المنفذ
const PORT = process.env.PORT || 5000;

// ==========================================
// إعدادات الحماية والاتصال
// ==========================================

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==========================================
// الاتصال بقاعدة البيانات
// ==========================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// اختبار الاتصال بقاعدة البيانات
pool.query("SELECT NOW()")
  .then(() => {
    console.log("تم الاتصال بقاعدة البيانات بنجاح");
  })
  .catch((error) => {
    console.error("خطأ في الاتصال بقاعدة البيانات:", error.message);
  });

// ==========================================
// الصفحة الرئيسية للخادم
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "مرحباً بك في خادم TITO",
    status: "الخادم يعمل",
    version: "1.0.0"
  });
});

// ==========================================
// فحص حالة الخادم
// ==========================================

app.get("/api/health", async (req, res) => {

  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      server: "online",
      database: "online",
      time: result.rows[0].now
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      server: "online",
      database: "offline",
      error: error.message
    });

  }

});

// ==========================================
// تشغيل الخادم
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

  console.log("----------------------------------");
  console.log("TITO Backend يعمل الآن");
  console.log(`المنفذ: ${PORT}`);
  console.log("----------------------------------");

});
