// api/check_status.js
import { query } from "../utils/db.js";

export default async function handler(req, res) {
  try {
    const result = await query("SELECT * FROM mpesatransactions ORDER BY id DESC LIMIT 50");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
}
