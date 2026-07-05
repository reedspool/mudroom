import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import {
  createAccessorMock,
  createQuerySpy,
  createTestHandler,
} from "./test-utilities.ts";
import { Inputs } from "./inputs.ts";
import { assertSpyCalls } from "@std/testing/mock";
import { spy } from "@std/testing/mock";

Deno.test("querySpy Returns a number for a math expression", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("5+2", new Inputs());
  assert(result instanceof Promise);
  const awaited = await result;
  assertEquals(awaited, 7);
});

Deno.test("querySpy Rejects for JS evaluation error input", async () => {
  const querySpy = createQuerySpy();
  const result = querySpy("not actually JS", new Inputs());
  assert(result instanceof Promise);
  try {
    await result;
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message.includes("Unexpected identifier 'actually'"));
  }
});

Deno.test("accessorSpy gets a file", async () => {
  const accessorMock = createAccessorMock();
  const result = await accessorMock.GetText("kitchensink.html");
  assertStringIncludes(result, "<body>");
  assertSpyCalls(accessorMock.GetText as ReturnType<typeof spy>, 1);
});

Deno.test("createTestHandler empty doesn't error", () => {
  createTestHandler();
});

Deno.test("createTestHandler non-empty doesn't error", () => {
  createTestHandler({ query: createQuerySpy() });
});
