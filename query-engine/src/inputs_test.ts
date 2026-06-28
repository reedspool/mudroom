import { assertEquals } from "@std/assert";
import { Inputs } from "./inputs.ts";

Deno.test("Inputs empty", () => {
  const inputs = new Inputs();
  assertEquals(inputs.Has("abcd"), false);
});

Deno.test("Inputs set and get", () => {
  const inputs = new Inputs();
  inputs.Set("abcd", "yes");
  assertEquals(inputs.Has("abcd"), true);
  const value = inputs.Get("abcd");
  assertEquals(value, "yes");
});

Deno.test("Inputs from object", () => {
  const inputs = Inputs.From({
    efgh: true,
  });
  const found = inputs.Has("efgh");
  assertEquals(found, true);
  const value = inputs.Get("efgh");
  assertEquals(value, true);

  const foundUnknown = inputs.Has("unknown");
  assertEquals(foundUnknown, false);
  const unknown = inputs.Get("unknown");
  assertEquals(unknown, undefined);
});

Deno.test("Inputs ForEach", () => {
  const original = { ijkl: true };
  const inputs = Inputs.From(original);
  const rebuilt: Record<string, unknown> = {};
  inputs.ForEach(([key, value]) => {
    rebuilt[key] = value;
  });
  assertEquals(rebuilt, original);
});

Deno.test("Inputs Clone", () => {
  const original = { ijkl: true };
  const inputs = Inputs.From(original);
  const clone = inputs.Clone();
  assertEquals(clone, inputs);
});
