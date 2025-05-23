/**
 * @typedef {{
 *   info: "info", // Info log level
 *   warn: "warn", // Warning log level
 *   error: "error" // Error log level
 * }} LogLevels
 * PigletJS log levels.
 */

/**
 * @typedef {{
 *   info: string, // Info log level alias
 * }} LogLevelsAliases
 * PigletJS log levels aliases used to call native console methods.
 */

/**
 * @typedef {{
 *   newValue: string|null, // New value of the attribute
 *   attrName: string, // Name of the attribute
 *   oldValue: string|null // Previous value of the attribute
 * }} AttributeChange
 * Attribute change object.
 */

/**
 * @typedef {{
 *   name: string, // Name of the reason
 *   data?: Record<string, object|string|number|boolean|null>, // Data of the reason
 *   originalReason?: Reason // Original reason
 * }} Reason
 * Reason of mounting/re-rendering a component.
 */

/**
 * @typedef {{
 *   appRoot: {
 *     routeLoaded: (route: string) => string, // Route loaded log
 *     errorLoading: (route: string) => string, // Error loading log
 *     unableToLoadComponent: (component: string) => string, // Unable to load component log
 *     componentConnected: (component: { __componentName: string }) => string, // Component connected log
 *   },
 *   socket: {
 *     connected: string, // Connected log
 *     closed: string, // Closed log
 *     error: string, // Error log
 *     reconnecting: (attempt: number, max: number) => string, // Reconnecting log
 *     maxReconnectAttempts: string, // Max reconnect attempts log
 *     serverRestarted: string // Server restarted log
 *   },
 *   trackingTree: (component: { constructor: { name: string } }) => string, // Tracking tree log
 * }} PigletLogs
 * PigletJS logs object.
 */

/**
 * @typedef {{
 *   coreLogsLevels: LogLevels, // Core logs levels
 *   coreLogLevelsAliases: LogLevelsAliases, // Core logs levels aliases
 *   callerAttribute: string, // Caller attribute
 *   routeAttribute: string, // Route attribute
 *   pigletLogs: PigletLogs, // PigletJS logs object
 *   socket: {
 *     messageTypes: {
 *       fullReload: string, // Full reload message type
 *       serverRestart: string, // Server restart message type
 *       reload: string // Reload message type
 *     }
 *   },
 *   error: {
 *     failedToFetchAPI: (url: string, error: { message: string }) => Error, // Failed to fetch API error
 *     unsupportedExpect: (type: string) => Error, // Unsupported expect error
 *     failedToParseFromURL: (url: string, type: string) => Error, // Failed to parse from URL error
 *     failedToFetchHTML: (componentName: string) => Error // Failed to fetch HTML error
 *   },
 *   warning: {
 *     expectedButGot: (expected: string, got: string) => string, // Expected but got warning
 *     failedToParseAs: (type: string) => string // Failed to parse as warning
 *   },
 *   componentRoute: {
 *     base: string, // Base route
 *     html: string, // HTML route
 *     script: string // Script route
 *   },
 *   apiRoute: string, // API route
 *   tagRegex: RegExp, // Tag regex
 *   pageNotFound: string, // Page not found message
 *   extension: {
 *     initialMessage: "initial", // Initial message type
 *     state: "state", // State message type
 *     tree: "tree" // Tree message type
 *   },
 *   attributePrefix: string, // Attribute prefix
 *   reason: {
 *     attributesChange: (changes: AttributeChange[]) => Reason, // Attributes change reason
 *     parentUpdate: (reason: Reason) => Reason, // Parent update reason
 *     addedToDOM: Reason, // Added to DOM reason
 *     onMount: Reason, // On mount reason
 *     stateChange: (changes: Array<unknown>) => Reason // State change reason
 *   },
 *   attributesObjectName: string, // Attributes object name
 *   notSettledSuffix: string, // Not settled suffix
 *   conditionAttribute: string, // Condition attribute
 *   conditionalName: string, // Conditional name
 *   appRootName: string, // App root name
 *   appRootTag: string // App root tag
 * }} Constants
 * PigletJS constants object, used to store widely used values.
 */

export /** @exports LogLevels */
/** @exports LogLevelsAliases */
/** @exports AttributeChange */
/** @exports Reason */
/** @exports PigletLogs */
/** @exports Constants */ {};
