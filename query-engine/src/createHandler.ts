import { TemplateInterface } from "./template.ts";

export async function createHandler(
  template: TemplateInterface,
  query: QueryInterface,
) {
  const url = new URL(req.url);

  if (req.method === "POST") {
    return new Response("", {
      headers: { "content-type": "text/html" },
    });
  }

  return new Response("Unknown request", {
    status: 500,
    headers: { "content-type": "text/html" },
  });
}
