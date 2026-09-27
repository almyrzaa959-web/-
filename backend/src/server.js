// ==========================================
// TITO - الخادم الرئيسي
// ==========================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// إعدادات الحماية
// ==========================================

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// ==========================================
// قاعدة البيانات
// ==========================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ==========================================
// نظام الحسابات
// ==========================================

const authRoutes = require("./auth");

app.use("/api/auth", authRoutes);

// ==========================================
// نظام الفيديوهات
// ==========================================

const videoRoutes = require("./videos");

app.use("/api/videos", videoRoutes);

// ==========================================
// الصفحة الرئيسية
// ==========================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    app: "TITO",
    message: "مرحباً بك في منصة تيتو",
    status: "الخادم يعمل",
    version: "1.0.0"
  });

});

// ==========================================
// فحص الخادم وقاعدة البيانات
// ==========================================

app.get("/api/health", async (req, res) => {

  try {

    await pool.query("SELECT NOW()");

    res.json({
      success: true,
      server: "online",
      database: "online"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      server: "online",
      database: "offline"
    });

  }

});

// ==========================================
// تشغيل الخادم
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

  console.log("=================================");
  console.log("TITO Backend يعمل الآن");
  console.log(`Port: ${PORT}`);
  console.log("=================================");

});
