export async function GET(): Promise<Response> {
  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 },
  );
}

export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 200 });
}
