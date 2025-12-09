// api/c2b/register.js
import { safPost } from "../utils/mpesa.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { ConfirmationURL, ValidationURL } = req.body;

  const payload = {
    ShortCode: process.env.SHORTCODE,
    ResponseType: "Completed",
    ConfirmationURL: ConfirmationURL || "https://www.geniusapps.click/api/callback/stk.js",
    ValidationURL: ValidationURL || "https://www.geniusapps.click/api/callback/stk.js"
  };

  try {
    const result = await safPost("/mpesa/c2b/v1/registerurl", payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "C2B register failed", details: err.response?.data });
  }
}
