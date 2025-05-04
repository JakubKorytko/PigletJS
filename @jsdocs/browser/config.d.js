/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {StateInterface} from "@jsdocs/browser/classes/State.d" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */
/** @import {Navigate} from "@jsdocs/browser/helpers.d" */
/**
 * @typedef {{
 *   info: boolean,
 *   warn: boolean,
 *   error: boolean
 * }} enableCoreLogs
 */

/**
 * @typedef {{
 *   allowDebugging: boolean,
 *   componentCounter: number,
 *   state: Record<string, StateInterface<unknown>>|{},
 *   enableCoreLogs: enableCoreLogs,
 *   tree: Record<string, TreeNode<ReactiveComponent | Element>>|{},
 *   extension: {
 *     sendInitialData?: () => void,
 *     sendTreeUpdate?: () => void,
 *     sendStateUpdate?: () => void
 *   },
 *   mountedComponents: Set<{
 *     tag: string,
 *     ref: HTMLElement|ReactiveComponent
 *   }>,
 *   log: (message: string, severity: "info"|"warn"|"error", ...args: any[]) => void,
 *   reset: () => void
 * }} Config
 */

/** @typedef {(message: string, severity: "info"|"warn"|"error", ...args: any[]) => void} Log */

/** @typedef {() => void} Reset */

/**
 * @global
 * @typedef {{
 *   navigate: Navigate,
 *   Piglet: Config
 * }} PigletWindow
 */

export /** @exports Reset */
/** @exports Log */
/** @exports Config */
/** @exports enableCoreLogs */ {};
