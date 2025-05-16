/**
 * @import {
 *  GetHost,
 *  IsShadowRoot,
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

/** @type {(target: DocumentFragment) => ReactiveComponent | null} */
const contextParent = (target) => {
  const contextValue = target.querySelector(
    CONST.fragmentRootTagName,
  )?.textContent;
  return window.Piglet.constructedComponents[contextValue];
};

/** @type {(target: DocumentFragment) => ReactiveComponent | null} */
const directParent = (target) => {
  const contextValue = target.querySelector(
    CONST.fragmentParentTagName,
  )?.textContent;
  return window.Piglet.constructedComponents[contextValue];
};

/** @type {GetHost} */
const getHost = function (node, parent) {
  if (!node) return null;

  /** @type {Node|ShadowRoot} */
  let target;

  if (parent) {
    target = node.getRootNode();
  } else if (isShadowRoot(node)) {
    target = node;
  } else if ("shadowRoot" in node) {
    const shadowRoot = node.shadowRoot;
    if (shadowRoot instanceof ShadowRoot) {
      target = shadowRoot;
    }
  }

  if ("host" in target && target.host instanceof ReactiveComponent) {
    return target.host;
  }

  if (target instanceof DocumentFragment) {
    return contextParent(target);
  }

  return null;
};

/** @type {IsShadowRoot} */
const isShadowRoot = function (shadowRootNode) {
  return shadowRootNode instanceof ShadowRoot;
};

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

const parseHTML = (html, owner) => {
  const range = owner.ownerDocument.createRange();
  const fragmentRootName = owner.internal.fragment.enabled
    ? owner.__componentKey
    : owner.internal.fragment.fragmentRoot?.__componentKey;

  const fragmentRoot = `<${CONST.fragmentRootTagName} style="display: none">${fragmentRootName}</${CONST.fragmentRootTagName}>`;
  const fragmentParent = `<${CONST.fragmentParentTagName} style="display: none;">${owner.__componentKey}</${CONST.fragmentParentTagName}>`;

  return range.createContextualFragment(
    `${!!fragmentRootName ? `${fragmentRoot}\n${fragmentParent}\n` : ""}${html}`,
  );
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

  const el = document.createElement(kebabTag);

  const attrs = values.find((v) => typeof v === "object" && v !== null);
  el.attrs = { ...(attrs || {}) };

  return el;
};

/** @type {(componentName: string, types: string[], shouldCache?: boolean) => Promise<{ html?: string, script?: Function, base?: ReactiveComponent }>} */
const fetchComponentData = async (componentName, types, shouldCache = true) => {
  const data = {
    html: undefined,
    script: undefined,
    base: undefined,
  };

  if (!types.length) {
    return data;
  }

  if (types.includes(CONST.componentRoute.html)) {
    const res = await fetch(
      `${CONST.componentRoute.html}/${componentName}${!shouldCache ? CONST.cacheKey() : ""}`,
    );
    const html = await res.text();

    if (html !== "export default false;" && html !== "") {
      data.html = html;
    }
  }

  if (types.includes(CONST.componentRoute.script)) {
    const module = await import(
      `${CONST.componentRoute.script}/${componentName}${!shouldCache ? CONST.cacheKey() : ""}`
    );
    if (module.default !== false) {
      data.script = module.default;
    }
  }

  if (types.includes(CONST.componentRoute.base)) {
    const module = await import(
      `${CONST.componentRoute.base}/${componentName}${!shouldCache ? CONST.cacheKey() : ""}`
    );
    if (module.default !== false) {
      data.base = module.default;
    }
  }

  return data;
};

export {
  getHost,
  isShadowRoot,
  getDeepValue,
  api,
  navigate,
  getMountedComponentsByTag,
  loadComponent,
  sendToExtension,
  fetchWithCache,
  parseHTML,
  $create,
  contextParent,
  directParent,
  toPascalCase,
  toKebabCase,
  extractComponentTagsFromString,
  fetchComponentData,
};
