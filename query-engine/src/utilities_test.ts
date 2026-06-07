import { assert, assertEquals } from "jsr:@std/assert";
import { disallowedParameterNames } from "./utilities.ts";

Deno.test("querying", () => {
  assert(Array.isArray(disallowedParameterNames));
  assertEquals(disallowedParameterNames.at(0), "break");
  assertEquals(disallowedParameterNames.at(-1), "undefined");
});
