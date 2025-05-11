/**
 * @import {
 *  GetHost,
 *  IsShadowRoot,
 *  GetDeepValue,
 *  ToPascalCase,
 *  ToPigletAttr,
 *  FromPigletAttr,
 *  Api,
 *  Navigate,
 *  ToKebabCase,
 *  GetMountedComponentsByTag,
 *  SendToExtension,
 *  LoadComponent,
 *  FetchWithCache,
 * } from '@jsdocs/browser/helpers.d'
 */

import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import CONST from "@Piglet/browser/CONST";
/** @type {GetHost} */
const getHost = function (node, parent) {
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
    const contextValue = target.querySelector("context-parent")?.textContent;
    return window.Piglet.component[contextValue];
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

const assignIdToComponent = function (component) {
  if (window.Piglet.componentsCount[component.__componentName] === undefined) {
    window.Piglet.componentsCount[component.__componentName] = 0;
  } else {
    window.Piglet.componentsCount[component.__componentName]++;
  }

  component.__id = window.Piglet.componentsCount[component.__componentName];
};

/** @type {ToPascalCase} */
const toPascalCase = function (str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
};

/** @type {ToPigletAttr} */
const toPigletAttr = function (name) {
  if (name.includes("-") || name.toLowerCase() === name) {
    return `${CONST.attributePrefix}${name}`;
  }

  const transformed = name.replace(/([A-Z])/g, "_$1").toLowerCase();
  return `${CONST.attributePrefix}${transformed}`;
};

/** @type {FromPigletAttr} */
const fromPigletAttr = function fromPigletAttr(pigletName) {
  if (!pigletName.startsWith(CONST.attributePrefix)) {
    return "";
  }
  let raw = pigletName.slice(7);

  return raw.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
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

  window.Piglet.AppRoot.route = route;

  return true;
};

/** @type {ToKebabCase} */
const toKebabCase = function (str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
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

/** @type {Record<string, NodeJS.Timeout>} */
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
    console.log("Sending to extension:", requestType);
    action();
  }, 100);
};

/** @type {LoadComponent} */
function loadComponent(_class) {
  const className = _class.name;
  const tagName = toKebabCase(className);

  const existingClass = customElements.get(tagName);
  if (!existingClass) {
    customElements.define(tagName, _class);
  }

  return customElements.whenDefined(tagName);
}

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
        throw new Error(`Failed to fetch from ${url}`);
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
  return range.createContextualFragment(
    `${owner.__isInFragment || owner.__useFragment ? `<context-parent style="display: none">${owner.__componentKey}</context-parent>\n` : ""}${html}`,
  );
};

export {
  getHost,
  assignIdToComponent,
  isShadowRoot,
  getDeepValue,
  toPascalCase,
  toPigletAttr,
  fromPigletAttr,
  api,
  navigate,
  toKebabCase,
  getMountedComponentsByTag,
  loadComponent,
  sendToExtension,
  fetchWithCache,
  parseHTML,
};
