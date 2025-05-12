/** @import {ClearAllListenersForHost, QueryElement, GetCallbackProxies, GetComponentData, ComponentData, ComponentMountCleanup, ScriptRunner} from "@jsdocs/browser/scriptRunner.d" */

import { toKebabCase, toPigletAttr } from "@Piglet/browser/helpers";
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import CONST from "@Piglet/browser/CONST";

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
  const root = hostElement.__useFragment
    ? hostElement.__fragment
    : hostElement.shadowRoot;

  const isCustom = CONST.pascalCaseRegex.test(selector);
  const el = root.querySelector(isCustom ? toKebabCase(selector) : selector);

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

  const initialAttributes = [...hostElement.attributes].reduce(
    (attrs, attr) => {
      attrs[attr.name] = attr.value;
      return attrs;
    },
    {},
  );

  return {
    component: {
      $attrs: {
        ...initialAttributes,
        ...hostElement._forwarded,
        ...hostElement.__attrs,
      },
      $id: hostElement.__id,
      $key: hostElement.__componentKey,
      $state: hostElement.state.bind(hostElement),
      $element: hostElement,
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
      $element: queryElement.bind(this, hostElement),
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

  function mountCallback(mountReason) {
    const { component, callbacks } = generateComponentData(this);

    let shouldRender = true;

    if (typeof hostElement.onBeforeUpdate === "function") {
      shouldRender = this.onBeforeUpdate() !== false;
    }

    if (!shouldRender) {
      return;
    }

    const moduleFunction = module.default.bind(this);

    moduleFunction({
      ...component,
      ...callbacks,
      $reason: mountReason ?? scriptReason,
    });

    componentMountCleanup(this, callbacks);

    if (typeof this.onAfterUpdate === "function") {
      this.onAfterUpdate();
    }
  }

  hostElement.onMount(mountCallback.bind(hostElement));
};

export default scriptRunner;
