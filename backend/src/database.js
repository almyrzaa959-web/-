const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "tito",
  password: "tito_password",
  database: "tito"
});

pool.on("error", (err) => {
  console.error("PostgreSQL error:", err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};
