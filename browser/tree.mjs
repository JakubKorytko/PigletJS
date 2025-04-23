import { useState } from "@Piglet/browser/state";
import Piglet from "@Piglet/browser/config";
import { sendToExtension } from "@Piglet/browser/extension";

/**
 * Assigns a unique component ID to a custom element if it doesn't already have one.
 * @param {typeof ReactiveComponent} el - The custom element to which the component ID will be assigned.
 * @returns {number} The assigned component ID.
 */
function assignComponentIdToElement(el) {
  if (!el.__componentId) {
    el.__componentId = ++Piglet.componentCounter;
  }
  return el.__componentId;
}

/**
 * Recursively builds a tree structure representing the custom elements in the DOM.
 * The tree includes custom elements and their state, children, and key information.
 *
 * @param {typeof ReactiveComponent} [root=document.body] - The root element to start building the tree from.
 * @returns {Object} The custom element tree structure.
 */
function buildCustomElementTree(root = document.body) {
  const tree = {};

  /**
   * Walks through a node and its children to collect relevant data.
   *
   * @param {ReactiveComponent} node - The DOM node to inspect.
   * @returns {Object|null} Data about the node or null if not relevant.
   */
  function walk(node) {
    const tagName = node.tagName?.toLowerCase?.();
    const isCustom = tagName?.includes("-");
    const childNodes = node.shadowRoot
      ? Array.from(node.shadowRoot.children)
      : Array.from(node.children);

    const children = {};
    for (const child of childNodes) {
      const childData = walk(child);
      if (childData && childData.key) {
        children[childData.key] = childData;
      }
    }

    if (isCustom) {
      if (node.constructor.name === "AppRoot") {
        node.__componentId = 0;
      } else {
        assignComponentIdToElement(node);
      }

      let state = {};
      if (node._observers && node.__componentKey) {
        for (const property of node._observers.keys()) {
          state[property] = useState(
            node._caller ?? node.__componentKey,
            property,
          )?.value;
        }
      }

      return {
        tag: tagName,
        componentName: node.constructor?.name ?? null,
        componentId: node.__componentId ?? null,
        key: node.__componentKey ?? null,
        state,
        children,
        element: node,
      };
    }

    if (tagName !== "style" && tagName !== "script") {
      return {
        tag: tagName ?? null,
        key: tagName ?? null,
        children,
      };
    }

    return null;
  }

  const rootData = walk(root);
  if (rootData?.key) {
    tree[rootData.key] = rootData;
  }

  return tree;
}

/**
 * Injects tree tracking functionality into a custom component class.
 * This enables the component to track its custom element tree and notify when changes occur.
 *
 * @param {typeof ReactiveComponent} targetClass - The custom component class to augment with tree tracking.
 */
function injectTreeTrackingToComponentClass(targetClass) {
  const originalConnected = targetClass.prototype.connectedCallback;

  /**
   * @this {ReactiveComponent}
   */
  targetClass.prototype.connectedCallback = function () {
    assignComponentIdToElement(this);

    this.__trackCustomTree__ = () => {
      const root = this;
      this.__tree = buildCustomElementTree(root);
      if (this.constructor.name === "AppRoot") {
        Piglet.tree = this.__tree;
      }
      Piglet.log(`[${this.constructor.name}] tracking tree`);
      sendToExtension("tree");
    };

    this.__trackCustomTree__();

    let parent = this.getRootNode().host;
    while (parent) {
      if (typeof parent.__trackCustomTree__ === "function") {
        parent.__trackCustomTree__();
        break;
      }
      parent = parent.getRootNode?.().host;
    }

    const observer = new MutationObserver(() => {
      this.__trackCustomTree__();

      let parent = this.getRootNode().host;
      while (parent) {
        if (typeof parent.__trackCustomTree__ === "function") {
          parent.__trackCustomTree__();
          break;
        }
        parent = parent.getRootNode?.().host;
      }
    });

    observer.observe(this.shadowRoot || this, {
      childList: true,
      subtree: true,
    });

    this.__customTreeObserver__ = observer;

    if (typeof originalConnected === "function") {
      originalConnected.call(this);
    }
  };

  const originalDisconnected = targetClass.prototype.disconnectedCallback;

  /**
   * @this {ReactiveComponent}
   */
  targetClass.prototype.disconnectedCallback = function () {
    if (this.__customTreeObserver__) {
      this.__customTreeObserver__.disconnect();
      sendToExtension("tree");
    }

    if (typeof originalDisconnected === "function") {
      originalDisconnected.call(this);
    }
  };
}

export { injectTreeTrackingToComponentClass, assignComponentIdToElement };
