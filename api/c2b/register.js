// api/c2b/register.js
import { safPost } from "../utils/mpesa.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { ConfirmationURL, ValidationURL } = req.body;

  const payload = {
    ShortCode: process.env.SHORTCODE,
    ResponseType: "Completed",
    ConfirmationURL: ConfirmationURL || "https://yourdomain.vercel.app/api/callback/generic",
    ValidationURL: ValidationURL || "https://yourdomain.vercel.app/api/callback/generic"
  };

  try {
    const result = await safPost("/mpesa/c2b/v1/registerurl", payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "C2B register failed", details: err.response?.data });
  }
}
