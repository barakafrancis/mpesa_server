// api/reversal.js
import { getAccessToken } from "../utils/mpesa.js";
import axios from "axios";
import { baseURL, config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    InitiatorName,
    TransactionID,
    Amount,
    ReceiverParty = config.shortcode,
    Remarks = "Reversal"
  } = req.body;

  if (!InitiatorName || !TransactionID || !Amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const InitiatorPassword = process.env.REVERSAL_PASSWORD || process.env.B2C_INITIATOR_PASSWORD;
  const securityCredential = Buffer.from(InitiatorPassword).toString("base64");

  try {
    const token = await getAccessToken();
    const payload = {
      Initiator: InitiatorName,
      SecurityCredential: securityCredential,
      CommandID: "TransactionReversal",
      TransactionID,
      Amount,
      ReceiverParty,
      RecieverIdentifierType: "11",
      ResultURL: "https://www.geniusapps.click/api/callback/generic",
      QueueTimeOutURL: "https://www.geniusapps.click/api/callback/generic",
      Remarks,
      Occasion: ""
    };

    const { data } = await axios.post(`${baseURL}/mpesa/reversal/v1/request`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Reversal failed", details: err.response?.data });
  }
}
