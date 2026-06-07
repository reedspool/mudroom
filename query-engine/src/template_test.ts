import { assertEquals } from "jsr:@std/assert";
import { template, Inputs } from "./template.ts";
import { spy } from "@std/testing/mock";

Deno.test("templating", async (t) => {
  const a: Array<{
    name: string;
    input: string;
    expected: string;
    inputs: Record<string, string>;
    expectedQueryCallArgs: Array<string>;
  }> = [
    {
      name: "Simple HTML has no effect",
      input: '<a href="https://example.com"><span>F</span></a>',
      expected: '<a href="https://example.com"><span>F</span></a>',
      inputs: {},
      expectedQueryCallArgs: [],
    },
    {
      name: "Parser removes incorrect closing tags, apparently?",
      input: "<a href=https://example.com>F</span></a>",
      expected: "<a href=https://example.com>F</a>",
      inputs: {},
      expectedQueryCallArgs: [],
    },
    {
      name: "Root selector",
      input: '<a href="https://example.com"><span>F</span></a>',
      expected: "<span>F</span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: [],
    },
    {
      name: "x-content",
      input: '<span x-content="5+2" />',
      expected: "<span>7</span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "nested x-content",
      input: '<span><span x-content="5+2" /></span>',
      expected: "<span><span>7</span></span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "<r- content=...>",
      input: '<r- content="5+2" />',
      expected: "7",
      inputs: { rootSelector: "r-" },
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "<set- foo=...>",
      input: '<span><set- foo="5+2" /><r- content="foo" /></span>',
      expected: "<span>7</span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: ["5+2", "foo"],
    },
  ];
  for (const { name, input, expected, inputs, expectedQueryCallArgs } of a) {
    await t.step(name, async () => {
      const context = new Inputs();
      const querySpy = spy(async (_) => 7);
      for (const [key, value] of Object.entries(inputs)) {
        context.Set(key, value);
      }
      const result = await template(input, context, querySpy);
      for (let i = 0; i < expectedQueryCallArgs.length; i++) {
        assertEquals(querySpy.calls[i].args[0], expectedQueryCallArgs[i]);
      }
      const rest = querySpy.calls
        .slice(expectedQueryCallArgs.length)
        .map((a) => a.args[0]);
      assertEquals(rest, [], `Query spy called more than expected`);
      assertEquals(result, expected);
    });
  }
});
