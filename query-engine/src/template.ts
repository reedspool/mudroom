import { parse, HTMLElement, Node, NodeType } from "node-html-parser";
import { TreeWalker, NodeFilter } from "./tree-walker.ts";
interface InputsInterface {
  Has(key: string): boolean;
  Get(key: string): string;
  Set(key: string, value: string): void;
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

function assertIsHTMLElement(a: Node): asserts a is HTMLElement {
  if (a.nodeType !== NodeType.ELEMENT_NODE) {
    throw new Error(`Treewalker showed a non-HTMLElement Node '${a}'`);
  }
}

function asHTMLElement(a: Node): HTMLElement {
  assertIsHTMLElement(a);
  return a;
}

function asHTMLElementOrNull(a: Node | null): HTMLElement | null {
  if (a === null) return a;
  assertIsHTMLElement(a);
  return a;
}

export function template(
  html: string,
  inputs: InputsInterface,
  query: (expression: string) => unknown = () => {},
): string {
  let root: HTMLElement | null = parse(html);
  if (inputs.Has("rootSelector")) {
    root = root.querySelector(inputs.Get("rootSelector"))!;
  }
  const treeWalker = new TreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let element = treeWalker.currentNode;
  assertIsHTMLElement(element);
  if (element === null) return "";

  let alreadySetForNextIteration: HTMLElement | null = null;
  do {
    element = treeWalker.currentNode;
    assertIsHTMLElement(element);

    if (element === null) return "";
    if (element.tagName === "R-") {
      if (element.hasAttribute("content")) {
        const result = query(element.getAttribute("content")!) + "";
        const shouldEvaluateChildren = false;
        const shouldKeepContents = false;

        // If this is root... everything's different. This won't be captured, because the treeWalker cannot just cannot.
        if (root === element) {
          return result;
        } else {
          element.after(result);
        }

        if (shouldEvaluateChildren) {
          alreadySetForNextIteration = asHTMLElementOrNull(
            treeWalker.nextNode(),
          );
        } else {
          alreadySetForNextIteration = asHTMLElementOrNull(
            treeWalker.nextNodeNotChildren(),
          );
        }
        if (shouldKeepContents) {
          element.after(...element.childNodes);
        }

        element.remove();
      }
    }
    if (element.tagName === "SET-") {
      for (const [key, value] of Object.entries(element.attributes)) {
        const result = query(value) + "";
        inputs.Set(key, result);
      }
      alreadySetForNextIteration = asHTMLElementOrNull(
        treeWalker.nextNodeNotChildren(),
      );
      element.remove();
    }
    if (element.hasAttribute("x-content")) {
      element.innerHTML = query(element.getAttribute("x-content")!) + "";
      element.removeAttribute("x-content");
    }
  } while (treeWalker.nextNode() || alreadySetForNextIteration);
  return root.toString();
}
