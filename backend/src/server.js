require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "TITO",
    status: "online",
    message: "TITO Backend يعمل بنجاح"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "ready",
    storage: "ready"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TITO Backend running on port ${PORT}`);
});
