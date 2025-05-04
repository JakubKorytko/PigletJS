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
 *  FadeOut,
 *  FadeIn,
 *  GetMountedComponentsByTag,
 *  SendToExtension,
 *  LoadComponent
 * } from '@jsdocs/browser/helpers.d'
 */

import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import CONST from "@Piglet/browser/CONST";
import { injectTreeTrackingToComponentClass } from "@Piglet/browser/tree";
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
const api = async function (path, expect = "json") {
  const url = `${CONST.apiRoute}/${path.replace(/^\/+/, "")}`;

  let res;
  try {
    res = await fetch(url);
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
  if (!window.Piglet.tree) return;

  const root = Object.values(window.Piglet.tree)[0];

  if (root.componentName !== "AppRoot") return;

  window.history.pushState({}, "", route);

  root.element.route = route;
};

/** @type {ToKebabCase} */
const toKebabCase = function (str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

/** @type {FadeOut} */
const fadeOut = function (element, duration = 400) {
  return new Promise((resolve) => {
    element.style.opacity = "1";
    element.style.transition = `opacity ${duration}ms`;

    void element.offsetWidth;

    element.style.opacity = "0";

    const handleTransitionEnd = (event) => {
      if (event.propertyName === "opacity") {
        element.removeEventListener("transitionend", handleTransitionEnd);
        element.style.display = "none";
        resolve();
      }
    };

    element.addEventListener("transitionend", handleTransitionEnd);
  });
};

/** @type {FadeIn} */
const fadeIn = function (element, duration = 400) {
  if (!element) return Promise.resolve();
  return new Promise((resolve) => {
    element.style.display = "";
    element.style.opacity = "0";
    element.style.transition = `opacity ${duration}ms`;

    void element.offsetWidth;

    element.style.opacity = "1";

    const handleTransitionEnd = (event) => {
      if (event.propertyName === "opacity") {
        element.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      }
    };

    element.addEventListener("transitionend", handleTransitionEnd);
  });
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

/** @type {SendToExtension} */
const sendToExtension = (requestType) => {
  const api = window.Piglet?.extension;
  const actions = {
    initial: api?.sendInitialData,
    state: api?.sendStateUpdate,
    tree: api?.sendTreeUpdate,
  };

  const action = actions[requestType];
  if (typeof action === "function") {
    action();
  }
};

/** @type {LoadComponent} */
function loadComponent(_class) {
  const className = _class.name;
  const tagName = toKebabCase(className);

  const existingClass = customElements.get(tagName);
  if (!existingClass) {
    injectTreeTrackingToComponentClass(_class);
    customElements.define(tagName, _class);
  }

  return customElements.whenDefined(tagName);
}

export {
  getHost,
  isShadowRoot,
  getDeepValue,
  toPascalCase,
  toPigletAttr,
  fromPigletAttr,
  api,
  navigate,
  toKebabCase,
  fadeOut,
  fadeIn,
  getMountedComponentsByTag,
  loadComponent,
  sendToExtension,
};
