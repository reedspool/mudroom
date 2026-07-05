import { AccessorInterface } from "./accessor.ts";
import { Inputs, InputsInterface } from "./inputs.ts";
import { QueryInterface } from "./query.ts";
import { TemplateInterface } from "./template.ts";

export type HandlerInterface = (req: Request) => Promise<Response>;
export function createHandler(
  template: TemplateInterface,
  query: QueryInterface,
  accessor: AccessorInterface,
): HandlerInterface {
  return async (req: Request) => {
    const _url = new URL(req.url);

    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { "content-type": "text/html" },
      });
    }
    let inputs: InputsInterface;
    try {
      const formData = await req.formData();
      inputs = Inputs.From(formData);
    } catch (error) {
      console.error("Could not parse form data:", error);
      return new Response("Bad request", {
        status: 400,
        headers: { "content-type": "text/html" },
      });
    }

    if (inputs.Has("query")) {
      return new Response(
        // TODO: Both the `.toString` and the `+ ""`
        //       are coercing to strings. I have full control over the source,
        //       though, so this is a design smell. Probably need to formalize
        //       when things are JS values and when they are strings. Maybe once
        //       it gets to the deno server, every Input should be interpreted
        //       as a JS value?
        (await query(inputs.Get("query")!.toString(), inputs)) + "",
        {
          headers: { "content-type": "text/html" },
        },
      );
    }
    if (inputs.Has("file")) {
      const fileContents = await accessor.GetText(inputs.GetText("file"));
      const evaluated = await template(fileContents, inputs, query);
      // TODO: See note above on coercion to string
      return new Response(evaluated + "", {
        headers: { "content-type": "text/html" },
      });
    }
    return new Response("", {
      headers: { "content-type": "text/html" },
    });
  };
}
