export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.searchParams.has("fetchMe")) {
    const fetchResponse = await fetch(url.searchParams.get("fetchMe")!);
    const fetchResponoseText = await fetchResponse.text();
    console.log(fetchResponoseText);
  }
  if (url.pathname === "/api") {
    return Response.json({
      message: "Hello, world!",
      time: new Date().toISOString(),
    });
  }

  return new Response("<h1>Welcome to Deno!</h1>", {
    headers: { "content-type": "text/html" },
  });
}

if (import.meta.main) {
  Deno.serve(handler);
}
