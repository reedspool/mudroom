import { assertEquals } from "jsr:@std/assert";
import { template } from "./template.ts";
import { createQuerySpy } from "./test-utilities.ts";
import { Inputs } from "./inputs.ts";

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
      name: "Root selector with query",
      input: '<a href="https://example.com"><span x-content="5+2">F</span></a>',
      expected: "<span>7</span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "Root selector with nested query",
      input:
        '<a href="https://example.com"><span><r- content="5+2" /></span></a>',
      expected: "<span>7</span>",
      inputs: { rootSelector: "span" },
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "x-content",
      input: '<span x-content="5+2" />',
      expected: "<span>7</span>",
      inputs: {},
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "nested x-content",
      input: '<span><span x-content="5+2" /></span>',
      expected: "<span><span>7</span></span>",
      inputs: {},
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "<r- content=...>",
      input: '<r- content="5+2" />',
      expected: "7",
      inputs: {},
      expectedQueryCallArgs: ["5+2"],
    },
    {
      name: "Nested <r- content=...>",
      input: '<span><r- content="5+2" /></span>',
      expected: "<span>7</span>",
      inputs: {},
      expectedQueryCallArgs: ["5+2"],
    },
  ];
  for (const { name, input, expected, inputs, expectedQueryCallArgs } of a) {
    await t.step(name, async () => {
      const context = new Inputs();

      const querySpy = createQuerySpy();
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
