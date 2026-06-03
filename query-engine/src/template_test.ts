import { assertEquals } from "jsr:@std/assert";
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
  inputs.Set("rootSelector", "span");
  const result = template(input, inputs);
  assertEquals(result, expected);
});
