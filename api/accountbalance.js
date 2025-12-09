// api/accountbalance.js
import { getAccessToken } from "../utils/mpesa.js";
import axios from "axios";
import { baseURL, config } from "../utils/config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { InitiatorName } = req.body;
  if (!InitiatorName) return res.status(400).json({ error: "InitiatorName required" });

  const InitiatorPassword = process.env.ACCOUNT_BALANCE_PASSWORD || process.env.B2C_INITIATOR_PASSWORD;
  const securityCredential = Buffer.from(InitiatorPassword).toString("base64");

  try {
    const token = await getAccessToken();
    const payload = {
      Initiator: InitiatorName,
      SecurityCredential: securityCredential,
      CommandID: "AccountBalance",
      PartyA: config.shortcode,
      IdentifierType: "4",
      Remarks: "Balance check",
      QueueTimeOutURL: "https://www.geniusapps.click/api/callback/stk.js",
      ResultURL: "https://www.geniusapps.click/api/callback/stk.js"
    };

    const { data } = await axios.post(`${baseURL}/mpesa/accountbalance/v1/query`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Balance query failed", details: err.response?.data });
  }
}
