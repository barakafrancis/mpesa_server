// utils/config.js
export const config = {
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  shortcode: process.env.SHORTCODE,
  passkey: process.env.PASSKEY,
  environment: process.env.ENVIRONMENT || "sandbox"
};

export const baseURL = config.environment === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";
