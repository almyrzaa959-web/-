const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [];

async function register(username, email, password) {
  const exists = users.find(
    user => user.email === email || user.username === username
  );

  if (exists) {
    throw new Error("الحساب موجود مسبقاً");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  return createToken(user);
}

async function login(email, password) {
  const user = users.find(user => user.email === email);

  if (!user) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const valid = await bcrypt.compare(password, user.password);

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
