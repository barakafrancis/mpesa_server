// api/stk_query.js
import { safPost, timestamp, stkPassword } from "../utils/mpesa.js";
import { config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { checkoutRequestID } = req.body;
  if (!checkoutRequestID) return res.status(400).json({ error: "checkoutRequestID required" });

  const ts = timestamp();
  const password = stkPassword(ts);

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: ts,
    CheckoutRequestID: checkoutRequestID
  };

  try {
    const result = await safPost("/mpesa/stkpushquery/v1/query", payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Query failed", details: err.response?.data });
  }
}
