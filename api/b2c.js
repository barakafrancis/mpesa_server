// api/b2c.js
import { getAccessToken } from "../utils/mpesa.js";
import axios from "axios";
import { baseURL, config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    InitiatorName,
    Amount,
    PartyB, // customer phone
    Remarks = "Payout",
    Occasion = ""
  } = req.body;

  if (!InitiatorName || !Amount || !PartyB) {
    return res.status(400).json({ error: "InitiatorName, Amount, PartyB required" });
  }

  // For B2C in sandbox, you can pass plain password (no cert needed)
  const InitiatorPassword = process.env.B2C_INITIATOR_PASSWORD;
  if (!InitiatorPassword) return res.status(500).json({ error: "B2C_INITIATOR_PASSWORD not set" });

  const securityCredential = Buffer.from(InitiatorPassword).toString("base64"); // sandbox trick

  try {
    const token = await getAccessToken();
    const payload = {
      InitiatorName,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount,
      PartyA: config.shortcode,
      PartyB,
      Remarks,
      QueueTimeOutURL: process.env.B2C_TIMEOUT_URL || "https://www.geniusapps.click/api/callback/stk.js",
      ResultURL: process.env.B2C_RESULT_URL || "https://www.geniusapps.click/api/callback/stk.js",
      Occasion
    };

    const { data } = await axios.post(`${baseURL}/mpesa/b2c/v1/paymentrequest`, payload, {
      headers: { Authorization: `Bearer ${token }` }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "B2C failed", details: err.response?.data || err.message });
  }
}
