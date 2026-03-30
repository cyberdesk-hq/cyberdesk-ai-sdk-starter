import { createCyberdeskClient } from "cyberdesk";

let client: ReturnType<typeof createCyberdeskClient> | undefined;

export function getCyberdeskClient() {
  if (!client) {
    client = createCyberdeskClient({
      apiKey: process.env.CYBERDESK_API_KEY || "",
      baseUrl: "https://api.cyberdesk.io",
    });
  }

  return client;
}