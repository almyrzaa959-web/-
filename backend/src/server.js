const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "TITO",
    message: "TITO Backend is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "pending",
    server: "TITO API"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TITO Backend running on port ${PORT}`);
});
