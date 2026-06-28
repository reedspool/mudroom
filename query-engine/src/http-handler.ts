import { Inputs } from "./inputs.ts";
import { QueryInterface } from "./query.ts";
import { TemplateInterface } from "./template.ts";

export type HandlerInterface = (req: Request) => Promise<Response>;
export function createHandler(
  template: TemplateInterface,
  query: QueryInterface,
): HandlerInterface {
  return async (req: Request) => {
    const url = new URL(req.url);

    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { "content-type": "text/html" },
      });
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("Could not parse form data:", error);
      return new Response("Bad request", {
        status: 400,
        headers: { "content-type": "text/html" },
      });
    }
    const inputs = new Inputs();
    if (formData.has("query")) {
      return new Response(
        (await query(formData.get("query")!.toString(), inputs)) + "",
        {
          headers: { "content-type": "text/html" },
        },
      );
    }
    return new Response("", {
      headers: { "content-type": "text/html" },
    });
  };
}
