// api/start_stk.js
import { safPost, timestamp, stkPassword } from "../utils/mpesa.js";
import { config } from "../utils/config.js";
import { query } from "../utils/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone, amount, accountReference = "Payment", transactionDesc = "Online Payment", callbackUrl } = req.body;

  if (!phone || !amount) return res.status(400).json({ error: "phone and amount required" });

  try {
    const ts = timestamp();
    const password = stkPassword(ts);

    const payload = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: config.shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl || process.env.STK_CALLBACK_URL || "https://yourdomain.vercel.app/api/callback/stk",
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await safPost("/mpesa/stkpush/v1/processrequest", payload);

    // Save to DB (optional)
    try {
      await query(`
        INSERT INTO mpesatransactions 
        (checkoutrequestid, merchantrequestid, phone, amount, status, created_at)
        VALUES (@checkout, @merchant, @phone, @amount, 'PENDING', GETDATE())
      `, {
        checkout: response.CheckoutRequestID,
        merchant: response.MerchantRequestID,
        phone,
        amount
      });
    } catch (e) { console.log("DB save failed (non-critical)"); }

    res.json(response);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "STK failed", details: err.response?.data || err.message });
  }
}
