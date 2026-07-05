import { assertSpyCalls, spy } from "@std/testing/mock";
import { Accessor } from "./accessor.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("Accessor GetText", async () => {
  const fetchSpy = spy((_input) => {
    const response = new Response("abcd");

    return Promise.resolve(response);
  }) satisfies typeof fetch;

  const accessor = new Accessor("testhost", "1234", fetchSpy);
  const result = await accessor.GetText("/efgh?onetwo=three");
  assertEquals(result, "abcd");
  assertSpyCalls(fetchSpy, 1);
  assertEquals(
    fetchSpy.calls[0].args[0],
    "https://testhost:1234/efgh?onetwo=three",
  );
});
