"use server";

import client from "./client";

export const getDesktopURL = async (id?: string) => {
  if (!id) throw new Error("Sandbox ID required for getDesktopURL");
  try {
    const response = await client.getDesktop({
      path: {
        id,
      },
    });
    
    const streamUrl = response.data?.stream_url;

    return { streamUrl, id };
  } catch (error) {
    console.error("Error in getDesktopURL:", error);
    throw error;
  }
};
