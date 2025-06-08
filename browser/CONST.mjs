/** @import {Constants} from "@jsdocs/browser/CONST.d" */

const cacheKey = () => `?noCache=${Date.now()}`;

/** @type {Constants} */
const CONST = {
  coreLogsLevels: {
    info: "info",
    warn: "warn",
    error: "error",
  },
  coreLogLevelsAliases: {
    info: "log",
  },
  componentNotFound: "export default false;",
  fragmentRootTagName: "fragment-parent",
  fragmentParentTagName: "fragment-direct-parent",
  reasonCache: ({ name }) => name !== "WS Reload",
  cacheKey,
  routeAttribute: "route",
  pigletLogs: {
    appRoot: {
      routeLoaded: (route) => `Route '${route}' loaded successfully.`,
      errorLoading: (route) => `Error loading route '${route}':`,
      unableToLoadComponent: (tag) => `Unable to load component <${tag}>`,
      componentConnected: ({ __componentName }) =>
        `${__componentName} connected`,
    },
    socket: {
      connected: "[Socket] Connected",
      closed: "[Socket] Connection closed",
      error: "[Socket] Error:",
      reconnecting: (when, attempt) =>
        `[Socket] Reconnecting in ${when}s (Attempt ${attempt})`,
      maxReconnectAttempts: "[Socket] Max reconnect attempts reached",
      serverRestarted: "[Socket] Server restart detected!",
    },
    conditionNotFoundInState: (conditionProperty) =>
      `Condition "${conditionProperty}" not found in state.`,
    sendToExtension: "Sending to extension:",
    trackingTree: ({ constructor: { name } }) => `[${name}] tracking tree`,
    errorLoadingScript: "Error loading script:",
    errorInComponentScript: "Error in component script:",
    cloneWarning:
      "⚠️ Piglet was unable to clone the state using structuredClone (probably because data is not serializable). " +
      "Object will be set as a reference, which means that changes to the passed object may lead to unexpected behavior. " +
      "You can try to use a different method to clone the state before passing it to Piglet, such as JSON.stringify/JSON.parse. " +
      "If you aware of this and want to silence this warning, make sure you are creating the state using $$(..., true).",
  },
  socket: {
    messageTypes: {
      fullReload: "fullReload",
      serverRestart: "serverRestart",
      reload: "reload",
    },
  },
  error: {
    failedToFetchAPI: (url, { message }) =>
      new Error(`Failed to fetch ${url}: ${message}`),
    unsupportedExpect: (expect) =>
      new Error(`Unsupported expect type: "${expect}"`),
    failedToParseFromURL: (expected, url) =>
      new Error(`Failed to parse response as "${expected}" from ${url}`),
    failedToFetchHTML: (componentName) =>
      new Error(`Failed to fetch HTML for ${componentName}`),
    invalidMarkup: (html) => new Error(`Invalid component markup: "${html}"`),
    failedToFetch: (url) => new Error(`Failed to fetch from ${url}`),
  },
  warning: {
    expectedButGot: (expected, got) =>
      `Warning: Expected response type "${expected}", but got "${got}".`,
    failedToParseAs: (expected) =>
      `Warning: Failed to parse as "${expected}". Response returned as plain text.`,
  },
  componentRoute: {
    html: "/component/html",
    script: "/component/script",
    layout: "/component/layout",
    // There is no base route, it is here to keep the structure
    base: "base",
  },
  apiRoute: "/api",
  tagRegex: /<([a-z][a-z0-9-]*)\b[^>]*\/?>/g,
  pascalCaseRegex: /[A-Z]([A-Z]*[a-z]+[A-Z]|[a-z]*[A-Z]+[a-z])[A-Za-z]*/,
  pageNotFound: "Page Not Found",
  extension: {
    initialMessage: "initial",
    state: "state",
    tree: "tree",
  },
  attributePrefix: "piglet.",
  reason: {
    attributesChange: (changes) => ({
      name: "Attributes changed",
      data: changes,
    }),
    parentUpdate: {
      name: "Parent mounted - waiter callback",
    },
    onMount: {
      name: "Component rendered",
    },
    WSReload: {
      name: "WS Reload",
    },
    herdUpdate: (changes) => ({
      name: "herdUpdate",
      data: changes,
    }),
    stateChange: (changes) => ({
      name: "stateChange",
      data: changes,
    }),
    fragmentInjected: { name: "Injected fragment" },
  },
  attributesObjectName: "attrs",
  conditionAttribute: "condition",
  conditionalName: "RenderIf",
  appRootName: "AppRoot",
  appRootTag: "app-root",
  stopComponentScriptExecution: "stopComponentScriptExecution",
  symbols: {
    nestedDeepProxyMarker: Symbol(),
    setViaGetterMarker: Symbol(),
  },
};

export default CONST;
