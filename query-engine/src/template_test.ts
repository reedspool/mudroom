import { assertEquals } from "jsr:@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";
import { template, Inputs } from "./template.ts";

Deno.test("Simple HTML has no effect", () => {
  const input = '<a href="https://example.com"><span>F</span></a>';
  const result = template(input, new Inputs());
  assertEquals(result, input);
});

Deno.test("Parser removes incorrect closing tags, apparently?", () => {
  const input = "<a href=https://example.com>F</span></a>";
  const expected = "<a href=https://example.com>F</a>";
  const result = template(input, new Inputs());
  assertEquals(result, expected);
});

Deno.test("Root selector", () => {
  const input = '<a href="https://example.com"><span>F</span></a>';
  const expected = "<span>F</span>";
  const inputs = new Inputs();
  inputs.Set("rootSelector", "span");
  const result = template(input, inputs);
  assertEquals(result, expected);
});

Deno.test("x-content", () => {
  const input = '<span x-content="5+2" />';
  const expected = "<span>7</span>";
  const inputs = new Inputs();
  const querySpy = spy((_) => 7);
  inputs.Set("rootSelector", "span");
  const result = template(input, inputs, querySpy);
  assertSpyCalls(querySpy, 1);
  assertEquals(querySpy.calls[0].args, ["5+2"]);
  assertEquals(result, expected);
});

Deno.test("<r- content=...>", () => {
  const input = '<r- content="5+2" />';
  const expected = "7";
  const inputs = new Inputs();
  const querySpy = spy((_) => 7);
  inputs.Set("rootSelector", "r-");
  const result = template(input, inputs, querySpy);
  assertSpyCalls(querySpy, 1);
  assertEquals(querySpy.calls[0].args, ["5+2"]);
  assertEquals(result, expected);
});
