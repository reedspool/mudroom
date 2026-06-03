import { type Node, NodeType } from "node-html-parser";
// Naive, incomplete implementation of Treewalker
// https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
export class TreeWalker {
  readonly root: Node;
  readonly whatToShow: number;
  readonly filter: Filter;
  currentNode: Node;
  constructor(
    root: Node,
    whatToShow: number = NodeFilter.SHOW_ALL,
    filter: Filter = () => NodeFilter.FILTER_ACCEPT,
  ) {
    this.root = root;
    this.currentNode = root;
    this.whatToShow = whatToShow;
    this.filter = filter;
  }

  parentNode() {
    if (this.currentNode === this.root) return null;
    let node = this.currentNode.parentNode;
    while (node && node !== this.root) {
      if (this.visible(node)) {
        this.currentNode = node;
        return node;
      }
      node = node.parentNode;
    }

    return null;
  }

  firstChild() {
    for (const node of this.currentNode.childNodes) {
      if (this.visible(node)) {
        this.currentNode = node;
        return node;
      }
    }

    return null;
  }

  lastChild() {
    for (const node of this.currentNode.childNodes.reverse()) {
      if (this.visible(node)) {
        this.currentNode = node;
        return node;
      }
    }

    return null;
  }

  nextSibling(): Node | null {
    if (this.currentNode === this.root) return null;
    let i = 0;
    if (!this.currentNode.parentNode) return null;
    const generation = this.currentNode.parentNode.childNodes;
    while (i < generation.length) {
      if (generation[i++] === this.currentNode) break;
    }

    while (i < generation.length) {
      const node = generation[i++];
      if (this.visible(node)) {
        this.currentNode = node;
        return node;
      }
    }

    return null;
  }

  previousSibling(): Node | null {
    if (this.currentNode === this.root) return null;
    let i = 0;
    if (!this.currentNode.parentNode) return null;
    const generation = this.currentNode.parentNode.childNodes.reverse();
    while (i < generation.length) {
      if (generation[i++] === this.currentNode) break;
    }

    while (i < generation.length) {
      const node = generation[i++];
      if (this.visible(node)) {
        this.currentNode = node;
        return node;
      }
    }

    return null;
  }

  // Depth first
  nextNode(): Node | null {
    if (this.firstChild()) return this.currentNode;
    if (this.nextSibling()) return this.currentNode;
    while (this.parentNode()) {
      if (this.nextSibling()) return this.currentNode;
    }
    return null;
  }

  previousNode(): Node | null {
    if (this.previousSibling()) return this.currentNode;
    if (this.parentNode()) return this.currentNode;
    return null;
  }

  /**
   * Useful for skipping a node's contents, e.g. when it is to be removed
   **/
  nextNodeNotChildren(): Node | null {
    if (this.nextSibling()) return this.currentNode;
    while (this.parentNode()) {
      if (this.nextSibling()) return this.currentNode;
    }
    return null;
  }

  private visible(node: Node): boolean {
    const f = this.whatToShow;
    const nf = NodeFilter;
    const nt = node.nodeType;
    const NT = NodeType;
    if (f === nf.SHOW_ALL) return true;
    if (isSet(f, nf.SHOW_ELEMENT) && nt == NT.ELEMENT_NODE) return true;
    if (isSet(f, nf.SHOW_ELEMENT) && nt == NT.ELEMENT_NODE) return true;
    if (isSet(f, nf.SHOW_TEXT) && nt == NT.TEXT_NODE) return true;
    if (isSet(f, nf.SHOW_COMMENT) && nt == NT.COMMENT_NODE) return true;

    return false;
  }
}

function isSet(what: number, mask: NodeFilter[keyof NodeFilter]): boolean {
  return (what & mask) === mask;
}

// Taken from https://gist.github.com/kindy/eb7e2581265fb80aae11ab50f668ec20#file-polyfill-document-createtreewalker-js-L27
export const NodeFilter = {
  // Constants for acceptNode()
  FILTER_ACCEPT: 1,
  FILTER_REJECT: 2,
  FILTER_SKIP: 3,

  // Constants for whatToShow
  SHOW_ALL: 0xffffffff,
  SHOW_ELEMENT: 0x1,
  SHOW_ATTRIBUTE: 0x2, // historical
  SHOW_TEXT: 0x4,
  SHOW_CDATA_SECTION: 0x8, // historical
  SHOW_ENTITY_REFERENCE: 0x10, // historical
  SHOW_ENTITY: 0x20, // historical
  SHOW_PROCESSING_INSTRUCTION: 0x40,
  SHOW_COMMENT: 0x80,
  SHOW_DOCUMENT: 0x100,
  SHOW_DOCUMENT_TYPE: 0x200,
  SHOW_DOCUMENT_FRAGMENT: 0x400,
  SHOW_NOTATION: 0x800, // historical
} as const;
export type NodeFilter = typeof NodeFilter;

export type Filter = (
  node: Node,
) =>
  | NodeFilter["FILTER_ACCEPT"]
  | NodeFilter["FILTER_REJECT"]
  | NodeFilter["FILTER_SKIP"];
