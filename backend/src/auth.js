const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("./database");

async function register(username, email, password) {
  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1 OR username = $2",
    [email, username]
  );

  if (existing.rows.length > 0) {
    throw new Error("الحساب موجود مسبقاً");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, passwordHash]
  );

  return createToken(result.rows[0]);
}

async function login(email, password) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!valid) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  return createToken(user);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET || "TITO_CHANGE_THIS_SECRET",
    {
      expiresIn: "30d"
    }
  );
}

module.exports = {
  register,
  login
};
