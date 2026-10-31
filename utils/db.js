// utils/db.js - MySQL connection (mysql2) for Vercel serverless
import mysql from "mysql2/promise";

let pool;

function buildConfig() {
  const ssl =
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  // Option 1: a single Service URI, e.g. mysql://user:pass@host:port/dbname
  if (process.env.DB_URI) {
    return {
      uri: process.env.DB_URI,
      ssl,
      waitForConnections: true,
      connectionLimit: 5,
      enableKeepAlive: true
    };
  }

  // Option 2: separate values
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true
  };
}

export function getDb() {
  if (!pool) {
    if (!process.env.DB_URI && !process.env.DB_HOST) {
      throw new Error("Missing DB_URI or DB_HOST in environment variables");
    }
    pool = mysql.createPool(buildConfig());
  }
  return pool;
}

// Helper: const rows = await query("SELECT ... WHERE id = ?", [id]);
export async function query(sql, params = []) {
  const [rows] = await getDb().execute(sql, params);
  return rows;
}
