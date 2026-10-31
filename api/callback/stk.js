// api/callback/stk.js
import { getDb } from "../../utils/db.js";

export default async function handler(req, res) {
  try {
    const cb = req.body;

    // Normalize callback format
    const stk = cb.Body?.stkCallback || cb;
    const checkoutID = stk.CheckoutRequestID;
    const code = stk.ResultCode;
    const status = code === 0 ? "SUCCESS" : "FAILED";

    // Update record by checkoutrequestid
    const [result] = await getDb().execute(
      `UPDATE mpesatransactions
          SET status = ?, resultcode = ?, resultdesc = ?, callback_payload = ?
        WHERE checkoutrequestid = ?`,
      [status, code, stk.ResultDesc || "", JSON.stringify(cb), checkoutID]
    );

    // If no record updated, notify
    if (result.affectedRows === 0) {
      console.warn("⚠️ No matching checkoutrequestid found:", checkoutID);
    }

    res.status(200).json({ message: "OK" });

  } catch (err) {
    console.error("STK Callback Error:", err);
    res.status(500).json({ error: "DB update failed" });
  }
}
