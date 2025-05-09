import client from "@/lib/cyberdesk/client";

async function handleStartDesktop(request: Request) {

  const result = await client.launchDesktop({
    body: {
      timeout_ms: 86400000,
    }
  })

  if (result.response.status !== 200 || !result.data) {
    return new Response(JSON.stringify({ error: result.response.statusText }), { status: 500 });
  }

  return new Response(JSON.stringify({ id: result.data.id }), { status: 200 });
}

// Handle POST requests
export async function POST(request: Request) {
  return handleStartDesktop(request);
} 