// api/b2b.js
import { getAccessToken } from "../utils/mpesa.js";
import axios from "axios";
import { baseURL, config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    InitiatorName,
    Amount,
    PartyA = config.shortcode,
    PartyB,
    AccountReference = "B2B",
    Remarks = "B2B Transfer"
  } = req.body;

  if (!InitiatorName || !Amount || !PartyB) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const InitiatorPassword = process.env.B2B_INITIATOR_PASSWORD;
  if (!InitiatorPassword) return res.status(500).json({ error: "B2B_INITIATOR_PASSWORD missing" });

  const securityCredential = Buffer.from(InitiatorPassword).toString("base64");

  try {
    const token = await getAccessToken();
    const payload = {
      InitiatorName,
      SecurityCredential: securityCredential,
      CommandID: "BusinessToBusinessTransfer",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "4",
      Amount,
      PartyA,
      PartyB,
      AccountReference,
      Remarks,
      QueueTimeOutURL: process.env.B2B_TIMEOUT_URL || "https://www.geniusapps.click/api/callback/generic",
      ResultURL: process.env.B2B_RESULT_URL || "https://www.geniusapps.click/api/callback/generic"
    };

    const { data } = await axios.post(`${baseURL}/mpesa/b2b/v1/paymentrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "B2B failed", details: err.response?.data });
  }
}
