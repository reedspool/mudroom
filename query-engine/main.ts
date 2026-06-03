export function handler(req: Request): Response {
  const url = new URL(req.url);
  fetch("https://www.google.com").then(a=>a.text()).then(console.log)
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
