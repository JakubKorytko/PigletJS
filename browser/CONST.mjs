/** @import {Constants} from "@jsdocs/browser/CONST.d" */

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
  callerAttribute: "host__element",
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
    trackingTree: ({ constructor: { name } }) => `[${name}] tracking tree`,
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
  },
  warning: {
    expectedButGot: (expected, got) =>
      `Warning: Expected response type "${expected}", but got "${got}".`,
    failedToParseAs: (expected) =>
      `Warning: Failed to parse as "${expected}". Response returned as plain text.`,
  },
  componentRoute: {
    base: "/component",
    html: "/component/html",
    script: "/component/script",
  },
  apiRoute: "/api",
  tagRegex: /<([a-z][a-z0-9-]*)\b[^>]*\/?>/g,
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
    parentUpdate: (reason) => ({
      name: "Parent updated",
      originalReason: reason,
    }),
    addedToDOM: {
      name: "Added to DOM",
    },
    onMount: {
      name: "Component rendered",
    },
    stateChange: (changes) => ({
      name: "stateChange",
      data: changes,
    }),
  },
  attributesObjectName: "attrs",
  notSettledSuffix: "_NOT_SETTLED",
  conditionAttribute: "condition",
  conditionalName: "RenderIf",
  appRootName: "AppRoot",
  appRootTag: "app-root",
};

export default CONST;
