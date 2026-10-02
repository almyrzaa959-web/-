const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function connectDatabase() {
  try {
    await pool.query("SELECT 1");
    console.log("TITO Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
}

module.exports = {
  pool,
  connectDatabase
};
