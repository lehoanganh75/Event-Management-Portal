const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, "../public");
console.log("Serving static files from:", publicPath);

app.use(express.static(publicPath));

app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Server is running",
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;