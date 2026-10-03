const { Pool } = require("pg");

const pool = new Pool({
  host: "postgres",
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
