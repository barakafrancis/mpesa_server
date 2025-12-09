// api/callback/stk.js
import { query } from "../../utils/db.js";

const pool = await sql.connect(config);
await pool.request()
  .input("status", sql.VarChar, status)
  .input("code", sql.Int, code)
  .input("desc", sql.VarChar, stk.ResultDesc || "")
  .input("payload", sql.VarChar(sql.MAX), JSON.stringify(cb))
  .input("checkout", sql.VarChar, checkoutID)
  .query(`
    UPDATE mpesatransactions 
    SET status = @status, resultcode = @code, resultdesc = @desc,
        callback_payload = @payload, updated_at = GETDATE()
    WHERE checkoutrequestid = @checkout
  `);

    res.json({ message: "OK" });
  } catch (err) {
  console.error("STK Callback Error:", err);
  res.status(500).json({ error: "DB update failed" });
}
}
