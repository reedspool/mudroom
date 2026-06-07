import { assert, assertEquals, assertRejects } from "@std/assert";
import { createQuerySpy } from "./test-utilities.ts";

Deno.test("Returns a number for a math expression", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("5+2");
  assert(result instanceof Promise);
  const awaited = await result;
  assertEquals(awaited, 7);
});

Deno.test("Rejects for unknown input", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("this is obviously incorrrect");
  assert(result instanceof Promise);
  try {
    await result;
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message.includes("'this is obviously incorrrect'"));
  }
});
