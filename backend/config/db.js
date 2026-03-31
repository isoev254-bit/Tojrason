const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "tojrason_delivery",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

pool.on("connect", () => {
  console.log("✅ Ба PostgreSQL пайваст шуд");
});

pool.on("error", (err) => {
  console.error("❌ Хатои PostgreSQL:", err.message);
});

module.exports = pool;
