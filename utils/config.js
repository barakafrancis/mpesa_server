// utils/config.js

const environment = process.env.ENVIRONMENT || "production";

export const config = {
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  shortcode: process.env.SHORTCODE,
  passkey: process.env.PASSKEY,
  environment
};

export const baseURL =
  environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
