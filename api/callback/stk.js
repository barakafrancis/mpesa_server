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

    // Connect to DB
    const db = await getDb();
    const collection = db.collection("mpesatransactions");

    // Update record by checkoutrequestid
    const result = await collection.updateOne(
      { checkoutrequestid: checkoutID },
      {
        $set: {
          status: status,
          resultcode: code,
          resultdesc: stk.ResultDesc || "",
          callback_payload: cb,
          updated_at: new Date()
        }
      }
    );

    // If no record updated, notify
    if (result.matchedCount === 0) {
      console.warn("⚠️ No matching checkoutrequestid found:", checkoutID);
    }

    res.status(200).json({ message: "OK" });

  } catch (err) {
    console.error("STK Callback Error:", err);
    res.status(500).json({ error: "DB update failed" });
  }
}
