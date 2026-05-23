require("dotenv").config();

const app = require("./src/app");
const { loadEventDataOnce } = require("./src/services/eventCacheService");
const { initDb } = require("./src/config/db");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  await initDb();
  await loadEventDataOnce();

  app.listen(PORT, HOST, () => {
    console.log(`AI Server running at http://${HOST}:${PORT}`);
  });
};

startServer();