const mysql = require("mysql2/promise");

async function check() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3309,
      user: "root",
      password: "root",
      database: "event_db"
    });
    console.log("Connected successfully!");

    const [cols] = await conn.execute("SHOW COLUMNS FROM event_sessions");
    console.log("Columns in event_sessions:", cols.map(c => c.Field).join(", "));

    const [sess] = await conn.execute("SELECT * FROM event_sessions LIMIT 2");
    console.log("Sample event_sessions:", sess);

  } catch (err) {
    console.error("Failed:", err);
  } finally {
    if (conn) await conn.end();
  }
}

check();

