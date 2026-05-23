require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "event_db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const initDb = async () => {
  try {
    console.log("[DB] Initializing AI planning audit and feedback tables...");
    await query(`
      CREATE TABLE IF NOT EXISTS ai_planning_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NULL,
        user_prompt TEXT NULL,
        intent_extracted JSON NULL,
        events_retrieved JSON NULL,
        best_events_selected JSON NULL,
        validation_errors JSON NULL,
        repair_attempts INT DEFAULT 0,
        final_output JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ai_planning_feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(255) NOT NULL,
        original_plan JSON NULL,
        edited_plan JSON NULL,
        edited_fields JSON NULL,
        rating INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("[DB] AI planning tables checked/created successfully.");
  } catch (err) {
    console.error("[DB-Init] Error creating tables:", err.message);
  }
};

module.exports = { pool, query, initDb };