import { assertEquals } from "jsr:@std/assert";
import { TreeWalker, NodeFilter } from "./tree-walker.ts";
import { parse } from "node-html-parser";

Deno.test("state is visible", () => {
  const node = parse("<span>T</span>");
  const treeWalker = new TreeWalker(node);
  assertEquals(treeWalker.currentNode, node);
  assertEquals(treeWalker.whatToShow, NodeFilter.SHOW_ALL);
  assertEquals(NodeFilter.FILTER_ACCEPT, treeWalker.filter(node));
});

Deno.test("Immediate parent is null", () => {
  const treeWalker = new TreeWalker(parse("<span>T</span>"));
  assertEquals(treeWalker.parentNode(), null);
});

Deno.test("First child text node", () => {
  const node = parse("<span>T</span>");
  const treeWalker = new TreeWalker(node);
  assertEquals(treeWalker.firstChild(), node.childNodes[0]);
});
