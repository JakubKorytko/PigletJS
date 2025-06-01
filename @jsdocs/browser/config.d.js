/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent" */
/** @import {StateInterface} from "@jsdocs/browser/classes/State.d" */
/** @import {Navigate, FetchWithCache} from "@jsdocs/browser/helpers.d" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */

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
 *   enableCoreLogs: EnableCoreLogs, // Whether to enable core logs
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

export /** @exports Reset */
/** @exports Log */
/** @exports Config */
/** @exports EnableCoreLogs */ {};
