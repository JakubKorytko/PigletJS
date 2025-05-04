/**
 * @import {
 *  AssignComponentIdToElement,
 *  BuildCustomElementTree,
 *  InjectTreeTrackingToComponentClass,
 *  Walk
 * }
 * from "@jsdocs/browser/tree.d"
 */
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";

import { useState } from "@Piglet/browser/hooks";
import Piglet from "@Piglet/browser/config";
import CONST from "@Piglet/browser/CONST";
import { getHost, sendToExtension } from "@Piglet/browser/helpers";
/** @type {AssignComponentIdToElement} */
const assignComponentIdToElement = function (el) {
  if (el.__componentId === undefined) {
    el.__componentId = ++Piglet.componentCounter;
  }
  return el.__componentId;
};

/** @type {BuildCustomElementTree<ReactiveComponent>} */
const buildCustomElementTree = function (root = document.body) {
  const tree = {};

  /** @type {Walk<ReactiveComponent|Element, ReactiveComponent>} */
  const walk = function (node) {
    const tagName = node.tagName?.toLowerCase?.();
    const isCustom = node instanceof ReactiveComponent;
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
      if (node.constructor.name === CONST.appRootName) {
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
            undefined,
            true,
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
  };

  const rootData = walk(root);
  if (rootData?.key) {
    tree[rootData.key] = rootData;
  }

  return tree;
};

/** @type {InjectTreeTrackingToComponentClass} */
const injectTreeTrackingToComponentClass = function (targetClass) {
  const originalConnected = targetClass.prototype.connectedCallback;

  targetClass.prototype.connectedCallback = function () {
    assignComponentIdToElement(this);

    this.__mountData = {
      key: this.__componentKey,
      tag: this.tagName,
      ref: this,
    };

    window.Piglet.mountedComponents.add(this.__mountData);

    this.__trackCustomTree = () => {
      const root = this;
      this.__tree = buildCustomElementTree(root);
      if (this.constructor.name === CONST.appRootName) {
        window.Piglet.tree = this.__tree;
      }
      window.Piglet.log(CONST.pigletLogs.trackingTree(this));
      sendToExtension(CONST.extension.tree);
    };

    this.__trackCustomTree();

    let parent = getHost(this, true);
    while (parent) {
      if (typeof parent.__trackCustomTree === "function") {
        parent.__trackCustomTree();
        break;
      }
      parent = getHost(parent, true);
    }

    const observer = new MutationObserver(() => {
      this.__trackCustomTree();

      let parent = getHost(this, true);
      while (parent) {
        if (typeof parent.__trackCustomTree === "function") {
          parent.__trackCustomTree();
          break;
        }
        parent = getHost(parent, true);
      }
    });

    observer.observe(this.shadowRoot || this, {
      childList: true,
      subtree: true,
    });

    this.__customTreeObserver = observer;

    if (typeof originalConnected === "function") {
      originalConnected.call(this);
    }
  };

  const originalDisconnected = targetClass.prototype.disconnectedCallback;

  targetClass.prototype.disconnectedCallback = function () {
    if (this.__customTreeObserver) {
      this.__customTreeObserver.disconnect();
      sendToExtension(CONST.extension.tree);
    }

    window.Piglet.mountedComponents.delete(this.__mountData);

    if (typeof originalDisconnected === "function") {
      originalDisconnected.call(this);
    }
  };
};

export { injectTreeTrackingToComponentClass, assignComponentIdToElement };
