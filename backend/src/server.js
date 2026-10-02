const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const db = require("./database");

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "TITO",
    message: "TITO Backend is running 🚀"
  });
});

// فحص السيرفر وقاعدة البيانات
app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      success: true,
      server: "online",
      database: "connected",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      server: "online",
      database: "disconnected"
    });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("🚀 TITO Backend Started");
  console.log(`🌐 Port: ${PORT}`);
  console.log("=================================");
});
