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
    componentConnected: (component: { _componentName: string }) => string;
    onStateChangeNotImplemented: (
      component: { _caller?: string; __componentKey: string },
      property: string,
    ) => string;
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
  callerAttribute: string;
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
    parentUpdate: (reason: Reason) => Reason;
    addedToDOM: Reason;
    onMount: Reason;
    stateChange: (changes: Array<unknown>) => Reason;
  };
  attributesObjectName: string;
  notSettledSuffix: string;
  conditionAttribute: string;
  conditionalName: string;
  appRootName: string;
  appRootTag: string;
}

declare const CONST: Constants;
export type { Reason };
export default CONST;
