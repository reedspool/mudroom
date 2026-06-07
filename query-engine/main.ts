import { handler } from "./src/http-handler.ts";

if (import.meta.main) {
  Deno.serve(handler);
}
