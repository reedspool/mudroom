import { createHandler } from "./src/http-handler.ts";
import { template } from "./src/template.ts";
import { query } from "./src/query.ts";

const handler = createHandler(template, query);

if (import.meta.main) {
  Deno.serve(handler);
}
