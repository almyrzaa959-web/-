// ==========================================
// TITO - نظام الفيديوهات
// ==========================================

const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ==========================================
// جلب الفيديوهات
// ==========================================

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        videos.id,
        videos.video_url,
        videos.thumbnail_url,
        videos.caption,
        videos.views,
        videos.created_at,
        users.id AS user_id,
        users.username,
        users.display_name,
        users.avatar_url
      FROM videos
      JOIN users
        ON users.id = videos.user_id
      ORDER BY videos.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      videos: result.rows
    });

  } catch (error) {

    console.error("Videos error:", error);

    res.status(500).json({
      success: false,
      message: "تعذر جلب الفيديوهات"
    });

  }

});

// ==========================================
// فيديو واحد
// ==========================================

router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        videos.id,
        videos.video_url,
        videos.thumbnail_url,
        videos.caption,
        videos.views,
        videos.created_at,
        users.id AS user_id,
        users.username,
        users.display_name,
        users.avatar_url
      FROM videos
      JOIN users
        ON users.id = videos.user_id
      WHERE videos.id = $1
    `, [id]);

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "الفيديو غير موجود"
      });

    }

    res.json({
      success: true,
      video: result.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الفيديو"
    });

  }

});

// ==========================================
// زيادة عدد المشاهدات
// ==========================================

router.post("/:id/view", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(`
      UPDATE videos
      SET views = views + 1
      WHERE id = $1
      RETURNING id, views
    `, [id]);

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "الفيديو غير موجود"
      });

    }

    res.json({
      success: true,
      video_id: result.rows[0].id,
      views: result.rows[0].views
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "تعذر تحديث المشاهدات"
    });

  }

});

// ==========================================
// معلومات الفيديو
// ==========================================

router.get("/:id/info", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        videos.id,
        videos.caption,
        videos.views,
        videos.created_at,
        users.username,
        users.display
