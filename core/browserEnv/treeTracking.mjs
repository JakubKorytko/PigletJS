import { useState } from "@/core/browserEnv/state";
import Piglet from "@/core/browserEnv/config";

function assignComponentIdToElement(el) {
  if (!el.__componentId) {
    el.__componentId = ++Piglet.componentCounter;
  }
  return el.__componentId;
}

function buildCustomElementTree(root = document.body) {
  const tree = {};

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

function injectTreeTrackingToComponentClass(klass) {
  const originalConnected = klass.prototype.connectedCallback;

  klass.prototype.connectedCallback = function () {
    assignComponentIdToElement(this);

    this.__trackCustomTree__ = () => {
      const root = this;
      this.__tree = buildCustomElementTree(root);
      if (this.constructor.name === "AppRoot") {
        Piglet.tree = this.__tree;
      }
      console.log(`[${this.constructor.name}] tracking tree`);
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

  const originalDisconnected = klass.prototype.disconnectedCallback;
  klass.prototype.disconnectedCallback = function () {
    if (this.__customTreeObserver__) {
      this.__customTreeObserver__.disconnect();
    }

    if (typeof originalDisconnected === "function") {
      originalDisconnected.call(this);
    }
  };
}

export { injectTreeTrackingToComponentClass, assignComponentIdToElement };
