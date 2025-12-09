// api/transactionstatus.js
import { getAccessToken } from "../utils/mpesa.js";
import axios from "axios";
import { baseURL, config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { InitiatorName, TransactionID } = req.body;
  if (!InitiatorName || !TransactionID) return res.status(400).json({ error: "Missing fields" });

  const InitiatorPassword = process.env.TRANSACTION_STATUS_PASSWORD || process.env.B2C_INITIATOR_PASSWORD;
  const securityCredential = Buffer.from(InitiatorPassword).toString("base64");

  try {
    const token = await getAccessToken();
    const payload = {
      Initiator: InitiatorName,
      SecurityCredential: securityCredential,
      CommandID: "TransactionStatusQuery",
      TransactionID,
      PartyA: config.shortcode,
      IdentifierType: "1",
      Remarks: "Status check",
      QueueTimeOutURL: "https://www.geniusapps.click/api/callback/stk.js",
      ResultURL: "https://www.geniusapps.click/api/callback/stk.js"
    };

    const { data } = await axios.post(`${baseURL}/mpesa/transactionstatus/v1/query`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Status query failed", details: err.response?.data });
  }
}
