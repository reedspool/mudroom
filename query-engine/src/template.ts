import { parse, HTMLElement } from "node-html-parser";
interface InputsInterface {
  Has(key: string): boolean;
  Get(key: string): string;
}

export class Inputs {
  private stuff: Record<string, string> = {};
  constructor() {}
  Has(key: string): boolean {
    return key in this.stuff;
  }
  Get(key: string): string {
    return this.stuff[key] ?? "";
  }
  Set(key: string, value: string): void {
    this.stuff[key] = value;
  }
}

export function template(
  html: string,
  inputs: InputsInterface,
  query: () => void = () => {},
): string {
  let dom: HTMLElement | null = parse(html);
  if (dom === null) return "";
  if (inputs.Has("rootSelector"))
    dom = dom.querySelector(inputs.Get("rootSelector"));
  if (dom === null) return "";
  return dom.toString();
}
