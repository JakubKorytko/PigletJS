/** @import {ClearAllListenersForHost, QueryElement, GetCallbackProxies, GetComponentData, ComponentData, ComponentMountCleanup, ScriptRunner} from "@jsdocs/browser/scriptRunner.d" */

import {
  createNestedStateProxy,
  createStateProxy,
  toKebabCase,
  useMarkerGenerator,
} from "@Piglet/browser/helpers";
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import CONST from "@Piglet/browser/CONST";

/** @type {WeakMap<ReactiveComponent, Map<string, Set<Function>>>} */
const elementListeners = new WeakMap(); // el -> Map<event, Set<callback>>
/** @type {WeakSet<ReactiveComponent>} */
const allTrackedElements = new Set(); // All els with listeners
/** @type {WeakMap<ReactiveComponent, Set<ReactiveComponent>>} */
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
  const root = hostElement.internal.fragment.enabled
    ? hostElement.internal.fragment.content
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
        const passInfo = {
          ref: el,
          updates: {},
          delayed: updates.delayed,
        };
        for (const [key, value] of Object.entries(updates)) {
          const previousValue = el.attrs[key];
          if (previousValue !== value) {
            passInfo.updates[key] = value;
          }
        }
        if (Object.keys(passInfo.updates).length === 0) {
          return proxy;
        }
        hostElement.forwardedQueue.push(passInfo);
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
    set(target, prop, value) {
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
      $attrs: hostElement.attrs,
      $element: hostElement,
      $P: createStateProxy(false, hostElement),
      $B: createStateProxy(true, hostElement),
      $$: useMarkerGenerator,
      $$P: createNestedStateProxy(false, hostElement),
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
  function mountCallback(mountReason) {
    const { component, callbacks } = generateComponentData(this);

    let shouldRender = true;

    if (typeof hostElement.onBeforeUpdate === "function") {
      shouldRender = this.onBeforeUpdate() !== false;
    }

    if (!shouldRender) {
      return;
    }

    const moduleFunction = module.bind(this);

    try {
      moduleFunction({
        ...component,
        ...callbacks,
        $reason: mountReason ?? scriptReason,
      });
    } catch (e) {
      console.error(CONST.pigletLogs.errorInComponentScript, e);
    }

    componentMountCleanup(this, callbacks);

    if (typeof this.onAfterUpdate === "function") {
      this.onAfterUpdate();
    }

    while (this.forwardedQueue.length) {
      const { ref, delayed, updates } = this.forwardedQueue.shift();
      ref.attrs = { ...ref.attrs, ...updates };
      if (ref?.internal?.mounted) {
        if (delayed) {
          setTimeout(() => {
            ref.__mountCallback(CONST.reason.attributesChange(updates));
          }, 0);
        } else {
          ref.__mountCallback(CONST.reason.attributesChange(updates));
        }
      }
    }
  }

  hostElement.__mountCallback = mountCallback.bind(hostElement);
};

export default scriptRunner;
