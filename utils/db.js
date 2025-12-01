// utils/db.js
import sql from "mssql";

let pool;
export async function getPool() {
  if (pool) return pool;
  pool = await sql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT || "1433"),
    database: process.env.DB_NAME,
    options: { encrypt: false, trustServerCertificate: true }
  });
  return pool;
}

export async function query(text, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  Object.keys(params).forEach(key => request.input(key, params[key]));
  const result = await request.query(text);
  return result;
}
