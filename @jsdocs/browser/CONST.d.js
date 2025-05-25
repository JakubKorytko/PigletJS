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
 *   sendToExtension: string, // Sending to extension log
 *   trackingTree: (component: { constructor: { name: string } }) => string, // Tracking tree log
 *   errorLoadingScript: string, // Error loading script log
 *   errorInComponentScript: string, // Error in component script log
 *   cloneWarning: string, // Clone warning log
 * }} PigletLogs
 * PigletJS logs object.
 */

/**
 * @typedef {{
 *   coreLogsLevels: LogLevels, // Core logs levels
 *   coreLogLevelsAliases: LogLevelsAliases, // Core logs levels aliases
 *   fragmentRootTagName: string, // Fragment root tag name
 *   fragmentParentTagName: string, // Fragment parent tag name
 *   cacheKey: () => string, // Cache key
 *   reasonCache: (name: Reason) => boolean, // Reason cache function
 *   componentNotFound: string, // Component not found message
 *   routeAttribute: string, // Route attribute
 *   pigletLogs: PigletLogs, // PigletJS logs object
 *   pascalCaseRegex: RegExp, // Pascal case regex
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
 *     html: string, // HTML route
 *     script: string, // Script route
 *     layout: string, // Layout route
 *     base: string // There is no base route, it is here to keep the structure
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
 *     parentUpdate: Reason, // Parent update reason
 *     stateChange: (changes: Array<unknown>) => Reason, // State change reason
 *     fragmentInjected: Reason, // Fragment injected reason
 *     WSReload: Reason
 *   },
 *   attributesObjectName: string, // Attributes object name
 *   conditionAttribute: string, // Condition attribute
 *   conditionalName: string, // Conditional name
 *   appRootName: string, // App root name
 *   appRootTag: string, // App root tag
 *   stopComponentScriptExecution: string, // Stop component script execution message
 * }} Constants
 * PigletJS constants object, used to store widely used values.
 */

export /** @exports LogLevels */
/** @exports LogLevelsAliases */
/** @exports AttributeChange */
/** @exports Reason */
/** @exports PigletLogs */
/** @exports Constants */ {};
