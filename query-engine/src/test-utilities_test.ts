import { assert, assertEquals } from "@std/assert";
import { createQuerySpy } from "./test-utilities.ts";
import { Inputs } from "./inputs.ts";

Deno.test("Returns a number for a math expression", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("5+2", new Inputs());
  assert(result instanceof Promise);
  const awaited = await result;
  assertEquals(awaited, 7);
});

Deno.test("Rejects for JS evaluation error input", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("not actually JS", new Inputs());
  assert(result instanceof Promise);
  try {
    await result;
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message.includes("Unexpected identifier 'actually'"));
    assert(error instanceof SyntaxError);
  }
});
