/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {StateInterface} from "@jsdocs/browser/classes/State.d" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */
/** @import {Navigate} from "@jsdocs/browser/helpers.d" */
/**
 * @typedef {{
 *   info: boolean, // Whether to log info messages
 *   warn: boolean, // Whether to log warning messages
 *   error: boolean // Whether to log error messages
 * }} EnableCoreLogs
 * Object that controls PigletJS core logs.
 */

/**
 * @typedef {{
 *   allowDebugging: boolean, // Whether to allow debugging
 *   componentCounter: number, // The number of components
 *   state: Record<string, StateInterface<unknown>>|{}, // The state of the components
 *   enableCoreLogs: EnableCoreLogs, // Whether to enable core logs
 *   tree: Record<string, TreeNode<ReactiveComponent | Element>>|{}, // The tree of the components
 *   extension: {
 *     sendInitialData?: () => void, // Send initial data to the extension
 *     sendTreeUpdate?: () => void, // Send tree update to the extension
 *     sendStateUpdate?: () => void // Send state update to the extension
 *   },
 *   mountedComponents: Set<{
 *     tag: string, // The tag of the component
 *     ref: HTMLElement|ReactiveComponent // The reference to the component
 *   }>,
 *   log: (message: string, severity: "info"|"warn"|"error", ...args: any[]) => void, // Log a message with a severity
 *   reset: () => void // Reset the PigletJS configuration
 * }} Config
 * PigletJS configuration object.
 */

/**
 * @typedef {(message: string, severity: "info"|"warn"|"error", ...args: any[]) => void} Log
 * Log a message with a severity.
 */

/**
 * @typedef {() => void} Reset
 * Reset the PigletJS configuration.
 */

/**
 * @global
 * @typedef {{
 *   navigate: Navigate, // Navigate to a route
 *   Piglet: Config // PigletJS configuration object
 * }} PigletWindow
 * PigletJS window object.
 */

export /** @exports Reset */
/** @exports Log */
/** @exports Config */
/** @exports EnableCoreLogs */ {};
