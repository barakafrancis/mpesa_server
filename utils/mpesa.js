// utils/mpesa.js
import axios from "axios";
import { config, baseURL } from "./config.js";

const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");

export async function getAccessToken() {
  const url = `${baseURL}/oauth/v1/generate?grant_type=client_credentials`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return data.access_token;
}

export function timestamp() {
  const pad = n => (n < 10 ? "0" + n : n);
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function stkPassword(ts) {
  return Buffer.from(config.shortcode + config.passkey + ts).toString("base64");
}

export async function safPost(path, body) {
  const token = await getAccessToken();
  const { data } = await axios.post(`${baseURL}${path}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    timeout: 30000
  });
  return data;
}
