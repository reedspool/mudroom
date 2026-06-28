import { assertEquals, assertRejects } from "jsr:@std/assert";
import { Inputs } from "./inputs.ts";
import { query } from "./query.ts";

Deno.test("querying", async (t) => {
  const a: Array<{
    name: string;
    input: string;
    expected: unknown;
    inputs: Record<string, unknown>;
  }> = [
    {
      name: "math",
      input: "5*2+3",
      expected: 13,
      inputs: {},
    },
    {
      name: "okay but different math",
      input: "12/3",
      expected: 4,
      inputs: {},
    },
    {
      name: "an unknown identifier is simply undefined",
      input: "foobar",
      expected: undefined,
      inputs: {},
    },
    {
      name: "a known identifier",
      input: "foobar",
      expected: 18,
      inputs: { foobar: 18 },
    },
    {
      name: "a function",
      input: "(() => (15))()",
      expected: 15,
      inputs: {},
    },
    {
      name: "an async function",
      input: "(async () => (18))()",
      expected: 18,
      inputs: {},
    },
  ];
  for (const { name, input, expected, inputs } of a) {
    await t.step(name, async () => {
      const context = new Inputs();
      for (const [key, value] of Object.entries(inputs)) {
        context.Set(key, value);
      }
      const result = await query(input, context);
      assertEquals(result, expected);
    });
  }
});

Deno.test("query errors", async () => {
  await assertRejects(() => query("5+", new Inputs()));
  await assertRejects(() => query("'", new Inputs()));
  await assertRejects(() => query("<span>F</span>", new Inputs()));
});
