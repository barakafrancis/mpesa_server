// api/start_stk.js
import { safPost, timestamp, stkPassword } from "../utils/mpesa.js";
import { config } from "../utils/config.js";
import { getDb } from "../utils/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const {
    phone,
    amount,
    accountReference = "Payment",
    transactionDesc = "Online Payment",
    callbackUrl
  } = req.body;

  if (!phone || !amount)
    return res.status(400).json({ error: "phone and amount required" });

  try {
    // --- 1. Generate STK Payload ---
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
      CallBackURL:
        callbackUrl ||
        process.env.STK_CALLBACK_URL ||
        "https://www.geniusapps.click/api/callback/stk",
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    // --- 2. Send to Safaricom ---
    const response = await safPost(
      "/mpesa/stkpush/v1/processrequest",
      payload
    );

    // Extract IDs returned by M-Pesa
    const checkout = response.CheckoutRequestID;
    const merchant = response.MerchantRequestID;

    // --- 3. Save to MongoDB ---
    try {
      const db = await getDb();
      const collection = db.collection("mpesatransactions");

      await collection.insertOne({
        checkoutrequestid: checkout,
        merchantrequestid: merchant,
        phone,
        amount: Number(amount),
        status: "PENDING",
        created_at: new Date()
      });
    } catch (err) {
      console.log("⚠️ MongoDB insert failed (non-critical)", err.message);
    }

    // --- 4. Return M-Pesa Response ---
    res.status(200).json(response);

  } catch (err) {
    console.error("STK ERROR:", err.response?.data || err);
    res.status(500).json({
      error: "STK failed",
      details: err.response?.data || err.message
    });
  }
}
