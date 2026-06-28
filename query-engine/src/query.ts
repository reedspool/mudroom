import { InputsInterface } from "./inputs.ts";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { disallowedParameterNames } from "./utilities.ts";

export type QueryInterface = (
  expression: string,
  inputs: InputsInterface,
) => Promise<unknown>;

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction/AsyncFunction
// AsyncFunction isn't a global constructor but it works just like Function
// Except TypeScript doesn't seem to think `new AsyncFunction` works, but it
// does in Node console.
const AsyncFunction = async function () {}.constructor;

// NOTE: Want this to be async so that all errors reject the returned promise
//       instead of throwing an exception, so that callers can handle issues
//       in one way
// deno-lint-ignore require-await
export const query: QueryInterface = async (
  expression,
  inputs,
): Promise<unknown> => {
  inputs = setAllMissingIdentifiersToUndefined(expression, inputs);
  // Fancyness for dynamic named parameters
  const args: string[] = [];
  const values: unknown[] = [];
  inputs.ForEach(([key, value]) => {
    if (disallowedParameterNames.includes(key)) return;
    args.push(key);
    values.push(value);
  });
  // Debug it?
  // args.push(`debugger;return ${expression};`)
  // Finally, the function body
  args.push(`return ${expression};`);
  const fn = AsyncFunction(...args);

  Object.defineProperty(fn, "name", {
    value: "query engine anonymous function",
  });

  return fn(...values);
};

export const setAllMissingIdentifiersToUndefined = (
  expression: string,
  inputs: InputsInterface,
) => {
  inputs = inputs.Clone();
  // If this ecmaVersion becomes an issue, try https://github.com/acornjs/acorn/tree/master/acorn-loose/
  const parsed = acorn.parseExpressionAt(expression, 0, {
    ecmaVersion: "latest",
    allowAwaitOutsideFunction: true,
  });
  walk.simple(parsed, {
    Identifier({ name }) {
      if (!inputs.Has(name) && !(name in globalThis))
        inputs.Set(name, undefined);
    },
  });

  return inputs;
};
