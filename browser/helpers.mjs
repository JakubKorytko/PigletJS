/**
 * @import {
 *  GetDeepValue,
 *  Api,
 *  Navigate,
 *  GetMountedComponentsByTag,
 *  SendToExtension,
 *  LoadComponent,
 *  FetchWithCache,
 * } from '@jsdocs/browser/helpers.d'
 */

import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import CONST from "@Piglet/browser/CONST";
import {
  toPascalCase,
  toKebabCase,
  extractComponentTagsFromString,
} from "@Piglet/browser/sharedHelpers";

/** @type {GetDeepValue} */
const getDeepValue = function (obj, pathParts) {
  if (!pathParts) return obj;

  let result = obj;

  for (let i = 0; i < pathParts.length; i++) {
    if (result && result.hasOwnProperty(pathParts[i])) {
      result = result[pathParts[i]];
    } else {
      return undefined;
    }
  }

  return result;
};

/** @type {Api} */
const api = async function (path, fetchOptions = {}, expect = "json") {
  const url = `${CONST.apiRoute}/${path.replace(/^\/+/, "")}`;

  let res;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    throw CONST.error.failedToFetchAPI(url, err);
  }

  const contentType = res.headers.get("Content-Type") || "";
  const expected = expect.toLowerCase();

  const parsers = {
    json: () => res.json(),
    text: () => res.text(),
    blob: () => res.blob(),
    arrayBuffer: () => res.arrayBuffer(),
    formData: () => res.formData(),
  };

  const parse = parsers[expected];

  if (!parse) {
    throw CONST.error.unsupportedExpect(expect);
  }

  try {
    const data = await parse();
    if (!contentType.includes(expected)) {
      window.Piglet.log(
        CONST.warning.expectedButGot(expected, contentType),
        CONST.coreLogsLevels.warn,
      );
    }
    return data;
  } catch (err) {
    try {
      const fallback = await res.text();
      window.Piglet.log(
        CONST.warning.failedToParseAs(expected),
        CONST.coreLogsLevels.warn,
      );
      return fallback;
    } catch {
      throw CONST.error.failedToParseFromURL(expected, url);
    }
  }
};

/** @type {Navigate} */
const navigate = (route) => {
  if (!window.Piglet.AppRoot) return false;

  window.history.pushState({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.Piglet.AppRoot.route = route;

  return true;
};

/** @type {GetMountedComponentsByTag} */
const getMountedComponentsByTag = function (tagName) {
  const componentRefs = [];

  if (!window.Piglet?.mountedComponents?.size) return componentRefs;

  for (const mountedComponent of window.Piglet.mountedComponents) {
    if (mountedComponent.tag.toLowerCase() === tagName.toLowerCase()) {
      componentRefs.push(mountedComponent.ref);
    }
  }

  return componentRefs;
};

/** @type {Record<string, NodeJS.Timeout | number>} */
const debounceTimers = {};

/** @type {SendToExtension} */
const sendToExtension = (requestType) => {
  const api = window.Piglet?.extension;
  const actions = {
    initial: api?.sendInitialData,
    state: api?.sendStateUpdate,
    tree: api?.sendTreeUpdate,
  };

  const action = actions[requestType];
  if (typeof action !== "function") return;

  clearTimeout(debounceTimers[requestType]);

  debounceTimers[requestType] = setTimeout(() => {
    window.Piglet.log(
      CONST.pigletLogs.sendToExtension,
      CONST.coreLogsLevels.info,
      requestType,
    );
    action();
  }, 300);
};

/** @type {LoadComponent} */
const loadComponent = function (_class) {
  const className = _class.name;
  const tagName = toKebabCase(className);

  const existingClass = customElements.get(tagName);
  if (!existingClass) {
    customElements.define(tagName, _class);
  }

  return customElements.whenDefined(tagName);
};

/** @type {FetchWithCache} */
const fetchWithCache = async (url) => {
  if (!window.Piglet.__fetchCache) {
    window.Piglet.__fetchCache = new Map();
  }

  if (!window.Piglet.__fetchQueue) {
    window.Piglet.__fetchQueue = new Map(); // URL → Promise
  }

  if (window.Piglet.__fetchCache.has(url)) {
    return window.Piglet.__fetchCache.get(url);
  }

  if (window.Piglet.__fetchQueue.has(url)) {
    return window.Piglet.__fetchQueue.get(url);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw CONST.error.failedToFetch(url);
      }

      const data = await response.text();
      window.Piglet.__fetchCache.set(url, data);
      return data;
    } finally {
      window.Piglet.__fetchQueue.delete(url);
    }
  })();

  window.Piglet.__fetchQueue.set(url, fetchPromise);
  return fetchPromise;
};

/**
 * Callback function to handle page reveal events.
 *
 * @param {Event} event - The event object triggered during the page reveal.
 * @returns {Promise<void>}
 */
const pageRevealCallback = (event) => {
  if (
    !event.viewTransition &&
    document.startViewTransition &&
    !window.viewTransitionRunning
  ) {
    return window.Piglet.AppRoot.appContent.runPageTransition("in", 200);
  }
};

/**
 * Converts an HTML string into a DocumentFragment.
 *
 * @param {string} html - The HTML string to parse.
 * @returns {DocumentFragment} - A DocumentFragment containing the parsed HTML content.
 */
function parseHTMLToFragment(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const frag = document.createDocumentFragment();

  [...doc.body.childNodes, ...doc.head.childNodes].forEach((node) =>
    frag.appendChild(node),
  );

  return frag;
}

/**
 * Parses an HTML string, processes custom elements, and applies additional transformations.
 *
 * @param {string} html - The HTML string to parse.
 * @param {ReactiveComponent} owner - The owner object containing metadata for processing.
 * @returns {DocumentFragment} - A DocumentFragment containing the processed HTML content.
 */
const parseHTML = (html, owner) => {
  const fragment = parseHTMLToFragment(html);

  const elementsWithHyphen = [...fragment.querySelectorAll("*")].filter((el) =>
    el.tagName.includes("-"),
  );

  elementsWithHyphen.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const customTag = customElements.get(tagName);
    if (!customTag) {
      return;
    }
    const attrs = Object.fromEntries(
      Array.from(el.attributes).map((attr) => [
        attr.name,
        attr.value === "" ? true : attr.value,
      ]),
    );
    attrs.fragmentRoot = owner.internal.fragment.enabled
      ? owner
      : owner.internal.fragment.fragmentRoot;
    attrs.parent = owner;
    const newEl = new customTag(attrs);
    el.replaceWith(newEl);
    if (!el.childNodes.length) {
      return;
    }
    newEl.append(...el.childNodes);
  });

  return fragment;
};

/** @type {(strings: TemplateStringsArray, ...values: any[]) => HTMLElement} */
const $create = function (strings, ...values) {
  const rawHtml = strings.join("$$SLOT$$").trim();

  const tagMatch = rawHtml.match(/^<([a-zA-Z0-9_-]+)\s*\$\$SLOT\$\$\s*\/?>$/);
  if (!tagMatch) {
    throw CONST.error.invalidMarkup(rawHtml);
  }

  const originalTag = tagMatch[1];
  const kebabTag = originalTag
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

  const attrs = values.find((v) => typeof v === "object" && v !== null);
  attrs.parent = this;
  const customTag = customElements.get(kebabTag);
  if (customTag) {
    return new customTag(attrs);
  }

  return document.createElement(kebabTag);
};

/** @type {(componentName: string, types: string[], shouldCache?: boolean) => Promise<{ html?: string, script?: Function, base?: ReactiveComponent }>} */
const fetchComponentData = async (componentName, types, shouldCache = true) => {
  const data = {
    html: undefined,
    script: undefined,
    base: undefined,
    layout: undefined,
  };

  window.Piglet.previousFetchComponentCacheKeys[componentName] ??= {
    html: "",
    script: "",
    layout: "",
  };

  const previousCache =
    window.Piglet.previousFetchComponentCacheKeys[componentName];

  if (!types.length) {
    return data;
  }

  if (types.includes(CONST.componentRoute.html)) {
    const cacheKey = CONST.cacheKey();
    if (!shouldCache) {
      previousCache.html = cacheKey;
    }
    const res = await fetch(
      `${CONST.componentRoute.html}/${componentName}${!shouldCache ? cacheKey : previousCache.html}`,
    );
    const html = await res.text();

    if (html !== CONST.componentNotFound && html !== "") {
      data.html = html;
    }
  }

  if (types.includes(CONST.componentRoute.layout)) {
    const cacheKey = CONST.cacheKey();
    if (!shouldCache) {
      previousCache.layout = cacheKey;
    }
    const res = await fetch(
      `${CONST.componentRoute.layout}/${componentName}${!shouldCache ? cacheKey : previousCache.layout}`,
    );
    const layout = await res.text();

    if (layout !== CONST.componentNotFound && layout !== "") {
      data.layout = layout;
    }
  }

  if (types.includes(CONST.componentRoute.script)) {
    const cacheKey = CONST.cacheKey();
    if (!shouldCache) {
      previousCache.script = cacheKey;
    }
    const module = await import(
      `${CONST.componentRoute.script}/${componentName}${!shouldCache ? cacheKey : previousCache.script}`
    );
    if (module.default !== false) {
      data.script = module.default;
    }
  }

  let cls;

  if (types.includes(CONST.componentRoute.base)) {
    if (!window.Piglet.registeredComponents[componentName]) {
      // noinspection JSClosureCompilerSyntax
      cls = class extends ReactiveComponent {
        static name = componentName;
        constructor(attrs) {
          super(attrs);
        }
      };
      await loadComponent(cls);
      window.Piglet.registeredComponents[componentName] = cls;
    } else {
      cls = window.Piglet.registeredComponents[componentName];
    }

    data.base = cls;
  }

  return data;
};

/**
 * Creates a proxy for the state object that allows for dynamic state creation
 * @type {(asRef: boolean, host: ReactiveComponent) => Object} */
const createStateProxy = function (asRef, host) {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === "symbol") return undefined;

        if (!(prop in host.states)) {
          host.states[prop] = host.state(prop, undefined, asRef);
        }

        return host.states[prop].value;
      },

      set(target, prop, value) {
        if (typeof prop === "symbol") return false;

        const key = String(prop);

        const isUsingUse = value && value.__piglet_use_marker === true;
        const initialValue = isUsingUse ? value.initialValue : value;

        if (!(key in host.states)) {
          host.states[key] = host.state(key, initialValue, asRef);
        } else if (!isUsingUse) {
          const state = host.states[key];

          state.value = value;
        }

        return true;
      },
    },
  );
};

/**
 * Wrapper for creating a deep proxy that triggers onChange when a property is set
 * @type {(target: Object, onChange: () => void) => Object} */
const createDeepOnChangeProxy = function (target, onChange) {
  return new Proxy(target, {
    get(target, property) {
      const item = target[property];
      if (item && typeof item === "object") {
        if (window.Piglet.__proxyCache.has(item))
          return window.Piglet.__proxyCache.get(item);
        const proxy = createDeepOnChangeProxy(item, onChange);
        window.Piglet.__proxyCache.set(item, proxy);
        return proxy;
      }
      if (typeof item === "function") {
        return item.bind(target);
      }
      return item;
    },
    set(target, property, newValue) {
      target[property] = newValue;
      onChange();
      return true;
    },
  });
};

/**
 * Returns a marker object for useState
 * @type {(initialValue: unknown) => { __piglet_use_marker: boolean, initialValue: unknown }} */
const useMarkerGenerator = function (initialValue) {
  return { __piglet_use_marker: true, initialValue };
};

/**
 * Creates an object that can be used to nested states while keeping reactivity
 * @type {(asRef: boolean, host: ReactiveComponent) => Object} */
const createNestedStateProxy = function (asRef, host) {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === "symbol") return undefined;

        if (!(prop in host.states)) {
          host.states[prop] = host.state(prop, undefined, asRef);
          const state = host.states[prop];
          if (typeof state.value === "object" && state.value !== null) {
            state.value = host.createDeepOnChangeProxy(state.value, () =>
              window.Piglet.state[host.__componentKey]._notify?.(),
            );
          }
        }

        return host.states[prop].value;
      },

      set(target, prop, value) {
        if (typeof prop === "symbol") return false;

        const key = String(prop);

        const isUsingUse = value && value.__piglet_use_marker === true;
        const initialValue = isUsingUse ? value.initialValue : value;
        if (!(key in host.states)) {
          host.states[key] = host.state(key, initialValue, asRef);
          const state = host.states[key];
          if (typeof state.value === "object" && state.value !== null) {
            window.Piglet.state[host.__componentKey][key]._state =
              createDeepOnChangeProxy(state.value, () =>
                window.Piglet.state[host.__componentKey][key]._notify?.(),
              );
          }
        } else if (!isUsingUse) {
          const state = host.states[key];

          if (typeof value === "object" && value !== null) {
            state.value = createDeepOnChangeProxy(value, () =>
              window.Piglet.state[host.__componentKey][key]._notify?.(),
            );
          } else {
            state.value = value;
          }
        }

        return true;
      },
    },
  );
};

export {
  getDeepValue,
  api,
  navigate,
  getMountedComponentsByTag,
  loadComponent,
  sendToExtension,
  fetchWithCache,
  parseHTML,
  $create,
  toPascalCase,
  toKebabCase,
  extractComponentTagsFromString,
  fetchComponentData,
  createNestedStateProxy,
  createStateProxy,
  createDeepOnChangeProxy,
  useMarkerGenerator,
  pageRevealCallback,
};
