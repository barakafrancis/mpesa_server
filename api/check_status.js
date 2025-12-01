// api/check_status.js
import { query } from "../utils/db.js";

export default async function handler(req, res) {
  try {
    const result = await query("SELECT TOP 50 * FROM mpesatransactions ORDER BY id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
}
