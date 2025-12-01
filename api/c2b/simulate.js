// api/c2b/simulate.js
import { safPost } from "../utils/mpesa.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { Amount = 10, Msisdn = "254708374149", BillRefNumber = "TEST" } = req.body;

  const payload = {
    ShortCode: process.env.SHORTCODE,
    CommandID: "CustomerPayBillOnline",
    Amount,
    Msisdn,
    BillRefNumber
  };

  try {
    const result = await safPost("/mpesa/c2b/v1/simulate", payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "C2B simulate failed", details: err.response?.data });
  }
}
