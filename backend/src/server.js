require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { connectDatabase } = require("./database");
const { register, login } = require("./auth");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.json({
    app: "TITO",
    status: "online",
    message: "TITO Backend يعمل بنجاح"
  });
});

// فحص الخادم وقاعدة البيانات
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "connected"
  });
});

// إنشاء حساب جديد
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "اسم المستخدم والبريد وكلمة المرور مطلوبة"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
      });
    }

    const token = await register(
      username.trim(),
      email.trim().toLowerCase(),
      password
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      token
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// تسجيل الدخول
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "البريد الإلكتروني وكلمة المرور مطلوبة"
      });
    }

    const token = await login(
      email.trim().toLowerCase(),
      password
    );

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`TITO Backend running on port ${PORT}`);
    });

  } catch (error) {
    console.error("TITO failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
