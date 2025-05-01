import { createCyberdeskClient } from "cyberdesk";

const client = createCyberdeskClient({
  apiKey: process.env.CYBERDESK_API_KEY || "",
  baseUrl: "https://api.cyberdesk.io",
});

export default client;