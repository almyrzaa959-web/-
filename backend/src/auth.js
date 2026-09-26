// ==========================================
// TITO - نظام الحسابات وتسجيل الدخول
// ==========================================

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || "tito-development-secret";

// ==========================================
// إنشاء حساب جديد
// ==========================================

router.post("/register", async (req, res) => {

  try {

    const {
      username,
      email,
      password,
      display_name
    } = req.body;

    if (!username || !email || !password || !display_name) {
      return res.status(400).json({
        success: false,
        message: "يرجى ملء جميع الحقول"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور يجب أن تكون 8 أحرف أو أكثر"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "اسم المستخدم أو البريد الإلكتروني مستخدم مسبقاً"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
      (username, email, password_hash, display_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, display_name, created_at`,
      [username, email, passwordHash, display_name]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );

    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب TITO بنجاح",
      user,
      token
    });

  } catch (error) {

    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الحساب"
    });

  }

});

// ==========================================
// تسجيل الدخول
// ==========================================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "يرجى إدخال البريد الإلكتروني وكلمة المرور"
      });
    }

    const result = await pool.query(
      `SELECT id, username, email, password_hash,
              display_name, bio, avatar_url
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      });
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: "30d"
      }
    );

    delete user.password_hash;

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user,
      token
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تسجيل الدخول"
    });

  }

});

// ==========================================
// التحقق من الحساب
// ==========================================

router.get("/me", async (req, res) => {

  try {

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "لم يتم إرسال رمز الدخول"
      });
    }

    const token = authorization.replace("Bearer ", "");

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    const result = await pool.query(
      `SELECT id, username, email,
              display_name, bio, avatar_url,
              created_at
       FROM users
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "الحساب غير موجود"
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {

    res.status(401).json({
      success: false,
      message: "رمز الدخول غير صالح أو منتهي"
    });

  }

});

module.exports = router;
