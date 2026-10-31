
import { getDb } from "../../utils/db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const cb = req.body;

    const stk = cb?.Body?.stkCallback || cb;

    const checkoutID = stk?.CheckoutRequestID ?? null;
    const code = stk?.ResultCode ?? null;
    const resultDesc = stk?.ResultDesc ?? "No result description";

    // Validate essential callback fields
    if (!checkoutID || code === null) {
      console.error("Invalid STK callback:", JSON.stringify(cb));

      return res.status(200).json({
        message: "Callback received but missing required fields"
      });
    }

    const status = Number(code) === 0 ? "SUCCESS" : "FAILED";

    const db = getDb();

    const [result] = await db.execute(
      `UPDATE mpesatransactions
       SET status = ?,
           resultcode = ?,
           resultdesc = ?,
           callback_payload = ?
       WHERE checkoutrequestid = ?`,
      [
        status,
        Number(code),
        resultDesc,
        JSON.stringify(cb),
        checkoutID
      ]
    );

    if (result.affectedRows === 0) {
      console.warn(
        "No matching checkoutrequestid found:",
        checkoutID
      );
    }

    console.log("STK callback processed:", {
      checkoutID,
      status,
      resultCode: code,
      affectedRows: result.affectedRows
    });

    return res.status(200).json({ message: "OK" });

  } catch (err) {
    console.error("STK Callback Error:", err);

    return res.status(500).json({
      error: "DB update failed"
    });
  }
}
