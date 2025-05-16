interface LogLevels {
  info: "info";
  warn: "warn";
  error: "error";
}

interface LogLevelsAliases {
  info: "log";
}

interface AttributeChange {
  newValue: string | null;
  attrName: string;
  oldValue: string | null;
}

interface Reason {
  name: string;
  data?: Record<string, object | string | number | boolean | null>;
  originalReason?: Reason;
}

interface PigletLogs {
  appRoot: {
    routeLoaded: (route: string) => string;
    errorLoading: (route: string) => string;
    unableToLoadComponent: (tag: string) => string;
    componentConnected: (component: { __componentName: string }) => string;
  };
  socket: {
    connected: string;
    closed: string;
    error: string;
    reconnecting: (when: number, attempt: number) => string;
    maxReconnectAttempts: string;
    serverRestarted: string;
  };
  trackingTree: (component: { constructor: { name: string } }) => string;
}

interface Constants {
  coreLogsLevels: LogLevels;
  coreLogLevelsAliases: LogLevelsAliases;
  routeAttribute: string;
  pigletLogs: PigletLogs;
  socket: {
    messageTypes: {
      fullReload: string;
      serverRestart: string;
      reload: string;
    };
  };
  error: {
    failedToFetchAPI: (url: string, error: { message: string }) => Error;
    unsupportedExpect: (expect: string) => Error;
    failedToParseFromURL: (expected: string, url: string) => Error;
    failedToFetchHTML: (componentName: string) => Error;
  };
  warning: {
    expectedButGot: (expected: string, got: string) => string;
    failedToParseAs: (expected: string) => string;
  };
  componentRoute: {
    base: string;
    html: string;
    script: string;
  };
  apiRoute: string;
  tagRegex: RegExp;
  pageNotFound: string;
  extension: {
    initialMessage: string;
    state: string;
    tree: string;
  };
  attributePrefix: string;
  reason: {
    attributesChange: (changes: AttributeChange[]) => Reason;
    parentUpdate: Reason;
    onMount: Reason;
    stateChange: (changes: Array<unknown>) => Reason;
    fragmentInjected: Reason;
    WSReload: Reason;
  };
  attributesObjectName: string;
  conditionAttribute: string;
  conditionalName: string;
  appRootName: string;
  appRootTag: string;
}

declare const CONST: Constants;
export type {
  LogLevelsAliases,
  AttributeChange,
  Reason,
  PigletLogs,
  Constants,
};
export default CONST;
