/** @namespace */

/**
 * @name LogLevels
 * @typedef {{
 *   info: "info",
 *   warn: "warn",
 *   error: "error"
 * }} LogLevels
 */

/**
 * @name LogLevelsAliases
 * @typedef {{
 *   info: string
 * }} LogLevelsAliases
 */

/**
 * @name AttributeChange
 * @typedef {{
 *   newValue: string|null,
 *   attrName: string,
 *   oldValue: string|null
 * }} AttributeChange
 */

/**
 * @name Reason
 * @typedef {{
 *   name: string,
 *   data?: Record<string, object|string|number|boolean|null>,
 *   originalReason?: Reason
 * }} Reason
 */

/**
 * @name PigletLogs
 * @typedef {{
 *   appRoot: {
 *     routeLoaded: (route: string) => string,
 *     errorLoading: (route: string) => string,
 *     unableToLoadComponent: (component: string) => string,
 *     componentConnected: (component: { _componentName: string }) => string,
 *     onStateChangeNotImplemented: (component: { _caller?: string, __componentKey: string }, key: string) => string
 *   },
 *   socket: {
 *     connected: string,
 *     closed: string,
 *     error: string,
 *     reconnecting: (attempt: number, max: number) => string,
 *     maxReconnectAttempts: string,
 *     serverRestarted: string
 *   },
 *   trackingTree: (component: { constructor: { name: string } }) => string
 * }} PigletLogs
 */

/**
 * @name Constants
 * @typedef {{
 *   coreLogsLevels: LogLevels,
 *   coreLogLevelsAliases: LogLevelsAliases,
 *   callerAttribute: string,
 *   routeAttribute: string,
 *   pigletLogs: PigletLogs,
 *   socket: {
 *     messageTypes: {
 *       fullReload: string,
 *       serverRestart: string,
 *       reload: string
 *     }
 *   },
 *   error: {
 *     failedToFetchAPI: (url: string, error: { message: string }) => Error,
 *     unsupportedExpect: (type: string) => Error,
 *     failedToParseFromURL: (url: string, type: string) => Error
 *   },
 *   warning: {
 *     expectedButGot: (expected: string, got: string) => string,
 *     failedToParseAs: (type: string) => string
 *   },
 *   componentRoute: {
 *     base: string,
 *     html: string,
 *     script: string
 *   },
 *   apiRoute: string,
 *   tagRegex: RegExp,
 *   pageNotFound: string,
 *   extension: {
 *     initialMessage: "initial",
 *     state: "state",
 *     tree: "tree"
 *   },
 *   attributePrefix: string,
 *   reason: {
 *     attributesChange: (changes: AttributeChange[]) => Reason,
 *     parentUpdate: (reason: Reason) => Reason,
 *     addedToDOM: Reason,
 *     onMount: Reason,
 *     stateChange: (changes: Array<unknown>) => Reason
 *   },
 *   attributesObjectName: string,
 *   notSettledSuffix: string,
 *   conditionAttribute: string,
 *   conditionalName: string,
 *   appRootName: string,
 *   appRootTag: string
 * }} Constants
 */

export /** @exports LogLevels */
/** @exports LogLevelsAliases */
/** @exports AttributeChange */
/** @exports Reason */
/** @exports PigletLogs */
/** @exports Constants */ {};
