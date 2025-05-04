/** @import {ClearAllListenersForHost, QueryElement, GetCallbackProxies, GetComponentData, ComponentData, ComponentMountCleanup, ScriptRunner} from "@jsdocs/browser/scriptRunner.d" */

import { toPigletAttr, getHost } from "@Piglet/browser/helpers";
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";

const elementListeners = new WeakMap(); // el -> Map<event, Set<callback>>
const allTrackedElements = new Set(); // All els with listeners
const hostToElements = new WeakMap(); // host -> Set<shadowEl>

/** @type {ClearAllListenersForHost} */
export const clearAllListenersForHost = function (hostElement) {
  const elements = hostToElements.get(hostElement);
  if (!elements) return;

  for (const el of elements) {
    const storage = elementListeners.get(el);
    if (storage) {
      for (const [event, callbacks] of storage.entries()) {
        for (const cb of callbacks) {
          el.removeEventListener(event, cb);
        }
      }
      storage.clear();
    }
    allTrackedElements.delete(el);
  }

  hostToElements.delete(hostElement);
};

/** @type {QueryElement} */
const queryElement = function (hostElement, selector) {
  const el = hostElement.shadowRoot.querySelector(selector);
  if (!el) return undefined;

  if (!hostToElements.has(hostElement)) {
    hostToElements.set(hostElement, new Set());
  }
  hostToElements.get(hostElement).add(el);

  allTrackedElements.add(el);

  const ensureStorage = () => {
    if (!elementListeners.has(el)) {
      elementListeners.set(el, new Map());
    }
    return elementListeners.get(el);
  };

  const api = {
    on(event, callback) {
      el.addEventListener(event, callback);
      const storage = ensureStorage();
      if (!storage.has(event)) storage.set(event, new Set());
      storage.get(event).add(callback);
      return proxy;
    },

    off(event, callback) {
      el.removeEventListener(event, callback);
      elementListeners.get(el)?.get(event)?.delete(callback);
      return proxy;
    },

    clearListeners() {
      const storage = elementListeners.get(el);
      if (storage) {
        for (const [event, callbacks] of storage.entries()) {
          for (const cb of callbacks) {
            el.removeEventListener(event, cb);
          }
        }
        storage.clear();
      }
      allTrackedElements.delete(el);
      hostToElements.get(hostElement)?.delete(el);
      return proxy;
    },
    pass(updates) {
      if (el && el instanceof ReactiveComponent) {
        for (const [key, value] of Object.entries(updates)) {
          if (typeof value === "function") {
            if (!el._forwarded) {
              el._forwarded = {};
            }
            el._forwarded[key] = value;
          } else {
            const attr = toPigletAttr(key);
            el.setAttribute(attr, value);
          }
        }
      }
      return proxy;
    },
  };

  const proxy = new Proxy(api, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (el) {
        const value = el[prop];
        return typeof value === "function" ? value.bind(el) : value;
      }
    },
    set(target, prop, value, receiver) {
      if (el) {
        el[prop] = value;
        return true;
      }
      return false;
    },
  });

  return proxy;
};

/** @type {GetComponentData} */
const generateComponentData = function (hostElement) {
  /** @type {ComponentData["callbacks"]["onBeforeUpdateRef"]} */
  const onBeforeUpdateRef = {
    value: () => {},
  };

  /** @type {ComponentData["callbacks"]["onAfterUpdateRef"]} */
  const onAfterUpdateRef = {
    value: () => {},
  };

  return {
    component: {
      name: hostElement.constructor.name,
      id: hostElement.__componentId,
      tree: hostElement.__tree,
      shadowRoot: hostElement.shadowRoot,
      key: hostElement.__componentKey,
      state: hostElement.state.bind(hostElement),
      element: hostElement,
      parent: getHost(hostElement, true) ?? null,
      attributes: hostElement.__attrs,
      forwarded: hostElement._forwarded,
    },
    callbacks: {
      $onBeforeUpdate: (callback) => {
        onBeforeUpdateRef.value = callback;
      },
      $onAfterUpdate: (callback) => {
        onAfterUpdateRef.value = callback;
      },
      onAfterUpdateRef,
      onBeforeUpdateRef,
      element: queryElement.bind(this, hostElement),
    },
  };
};

/** @type {ComponentMountCleanup} */
const componentMountCleanup = function (
  hostElement,
  { onBeforeUpdateRef, onAfterUpdateRef },
) {
  hostElement.onBeforeUpdate = onBeforeUpdateRef.value;
  hostElement.onAfterUpdate = onAfterUpdateRef.value;
};

/** @type {ScriptRunner} */
const scriptRunner = function (hostElement, module, scriptReason) {
  if (typeof module.default !== "function") {
    return;
  }

  hostElement.onMount((mountReason) => {
    const { component, callbacks } = generateComponentData(hostElement);

    let shouldRender = true;

    if (typeof hostElement.onBeforeUpdate === "function") {
      shouldRender = hostElement.onBeforeUpdate() !== false;
    }

    if (!shouldRender) {
      return;
    }

    module.default({
      ...component,
      ...callbacks,
      component,
      reason: mountReason ?? scriptReason,
    });

    componentMountCleanup(hostElement, callbacks);

    if (typeof hostElement.onAfterUpdate === "function") {
      hostElement.onAfterUpdate();
    }
  });
};

export default scriptRunner;
