const mysql = require("mysql2/promise");

async function check() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3309,
      user: "root",
      password: "root",
      database: "lucky_draw_db"
    });
    console.log("Connected successfully to lucky_draw_db!");

    const [tables] = await conn.execute("SHOW TABLES");
    console.log("Tables in lucky_draw_db:", tables.map(t => Object.values(t)[0]));

    const tableNames = tables.map(t => Object.values(t)[0]);
    for (const table of tableNames) {
      const [cols] = await conn.execute(`SHOW COLUMNS FROM ${table}`);
      console.log(`Columns in ${table}:`, cols.map(c => `${c.Field} (${c.Type})`).join(", "));
      const [[{ count }]] = await conn.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`Table: ${table}, Count: ${count}`);
    }

  } catch (err) {
    console.error("Failed:", err);
  } finally {
    if (conn) await conn.end();
  }
}

check();

