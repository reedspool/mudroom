import { assertEquals } from "jsr:@std/assert";
import { template } from "./template.ts";
import { query } from "./query.ts";
import { Inputs } from "./inputs.ts";

Deno.test("querying", async (t) => {
  const a: Array<{
    name: string;
    input: string;
    expected: string;
    inputs: Record<string, unknown>;
  }> = [
    {
      name: "No templating occurs",
      input: "<span>F</span>",
      expected: "<span>F</span>",
      inputs: {},
    },
    {
      name: "Basic expression",
      input: "<r- content='5+3' />",
      expected: "8",
      inputs: {},
    },
    {
      name: "Nested basic expression",
      input: "<span><r- content='5+3' /></span>",
      expected: "<span>8</span>",
      inputs: {},
    },
    {
      name: "<set- foo=...>",
      input: '<span><set- foo="5+2" /><r- content="foo" /></span>',
      expected: "<span>7</span>",
      inputs: {},
    },
  ];
  for (const { name, input, expected, inputs } of a) {
    await t.step(name, async () => {
      const context = new Inputs();
      for (const [key, value] of Object.entries(inputs)) {
        context.Set(key, value);
      }
      const result = await template(input, context, query);
      assertEquals(result, expected);
    });
  }
});
