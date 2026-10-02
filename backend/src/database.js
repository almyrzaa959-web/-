const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("TITO Database connected ✅");
});

pool.on("error", (err) => {
  console.error("Database error:", err);
});

module.exports = pool;
