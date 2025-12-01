// api/callback/stk.js
import { query } from "../../utils/db.js";

export default async function handler(req, res) {
  try {
    const cb = req.body;
    const stk = cb.Body?.stkCallback || cb;
    const checkoutID = stk.CheckoutRequestID;
    const code = stk.ResultCode;
    const status = code == 0 ? "SUCCESS" : "FAILED";

    if (checkoutID) {
      await query(`
        UPDATE mpesatransactions 
        SET status = @status, resultcode = @code, resultdesc = @desc, callback_payload = @payload, updated_at = GETDATE()
        WHERE checkoutrequestid = @checkout
      `, {
        status,
        code,
        desc: stk.ResultDesc || "",
        payload: JSON.stringify(cb),
        checkout: checkoutID
      });
    }
    res.json({ message: "OK" });
  } catch (err) {
    console.error(err);
    res.status(200).send("OK"); 
  }
}
