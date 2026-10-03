const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");

const db = require("./database");
const { register, login } = require("./auth");

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

// فحص الخادم وقاعدة البيانات
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

// تسجيل حساب جديد
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required"
      });
    }

    const token = await register(username, email, password);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// تسجيل الدخول
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required"
      });
    }

    const token = await login(email, password);

    res.json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("------------------------------------");
  console.log("🚀 TITO Backend Started");
  console.log(`🌐 Port: ${PORT}`);
  console.log("====================================");
});
