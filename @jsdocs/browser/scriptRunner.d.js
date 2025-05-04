/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */
/**
 * Represents a proxy for an element with event listener methods and updates.
 * @typedef {{
 *   on: (event: string, callback: Function) => ElementProxy,  // Add an event listener
 *   off: (event: string, callback: Function) => ElementProxy,  // Remove an event listener
 *   clearListeners: () => ElementProxy,  // Clear all event listeners
 *   pass: (updates: Record<string, *>) => ElementProxy  // Pass updates to the element
 * }} ElementProxy
 */

/**
 * Query for an element within a host component.
 * @typedef {(hostElement: ReactiveComponent, selector: string) => ElementProxy} QueryElement
 */

/**
 * Context object containing element, state, and variables for script execution.
 * @typedef {{
 *   element: HTMLElement,  // The element the script operates on
 *   state: *,  // The state of the element
 *   variables: Record<string, *>  // Variables available for the script
 * }} ScriptContext
 */

/**
 * Result of running a script, including success status and potential errors.
 * @typedef {{
 *   success: boolean,  // Whether the script execution was successful
 *   error?: Error,  // Error encountered, if any
 *   result?: *  // The result of the script execution
 * }} ScriptResult
 */

/**
 * Executes a script within a given context.
 * @typedef {(script: string, context: ScriptContext) => Promise<ScriptResult>} RunScript
 */

/**
 * Evaluates an expression within the given script context.
 * @typedef {(expression: string, context: ScriptContext) => *} EvaluateExpression
 */

/**
 * Creates a script context from an HTML element.
 * @typedef {(element: HTMLElement) => ScriptContext} CreateScriptContext
 */

/**
 * Clears all event listeners from a host element.
 * @typedef {(hostElement: ReactiveComponent) => void} ClearAllListenersForHost
 */

/**
 * Retrieves component data for a host element.
 * @typedef {(hostElement: ReactiveComponent) => ComponentData} GetComponentData
 */

/**
 * Generates callback proxies for state and attribute changes in a component.
 * @typedef {() => {
 *   onStateChange: (value: *, property: string, prevValue: *) => void,  // Callback for state changes
 *   onAttributeChange: (newValue: *, property: string, prevValue: *) => void  // Callback for attribute changes
 * }} GetCallbackProxies
 */

/**
 * Cleans up after a component is mounted, including removing event listeners.
 * @typedef {(hostElement: ReactiveComponent, callbacks: ComponentData["callbacks"]) => void} ComponentMountCleanup
 */

/**
 * Runs a script on a component, passing the reason for the script execution.
 * @typedef {(hostElement: ReactiveComponent, module: any, scriptReason: string) => void} ScriptRunner
 */

/**
 * Contains the data related to a component's state, attributes, and lifecycle callbacks.
 * @typedef {{
 *   component: {
 *     name: string,  // Component name
 *     id: number,  // Component ID
 *     tree: Record<string, TreeNode<ReactiveComponent | Element>>,  // Component tree
 *     shadowRoot: ShadowRoot|null,  // Shadow root of the component
 *     key: string,  // Unique component key
 *     state: Function,  // State function
 *     element: ReactiveComponent,  // Component element
 *     parent: ReactiveComponent|null|Element,  // Parent element of the component
 *     attributes: Record<string, *> | {},  // Component attributes
 *     forwarded: Record<string, Function> | {},  // Forwarded functions for the component
 *   },
 *   callbacks: {
 *     onStateChange: (value: *, property: string, prevValue: *) => void,  // Callback for state changes
 *     onAttributeChange: (newValue: *, property: string, prevValue: *) => void,  // Callback for attribute changes
 *     onUpdate: (callback: () => void) => void,  // Callback to update the component
 *     reactiveRef: { value: () => void },  // Reactive reference callback
 *     element: QueryElement,  // Element query method
 *     $onBeforeUpdate: (callback: () => boolean|void) => void,  // Before update callback
 *     $onAfterUpdate: (callback: () => void) => void,  // After update callback
 *     onAfterUpdateRef: { value: () => void },  // After update reference callback
 *     onBeforeUpdateRef: { value: () => boolean|void },  // Before update reference callback
 *   }
 * }} ComponentData
 */

export /** @exports ScriptContext */
/** @exports ScriptResult */
/** @exports RunScript */
/** @exports EvaluateExpression */
/** @exports CreateScriptContext */
/** @exports ComponentData */
/** @exports ElementProxy */
/** @exports QueryElement */
/** @exports ClearAllListenersForHost */
/** @exports GetCallbackProxies */
/** @exports GetComponentData */
/** @exports ComponentMountCleanup */
/** @exports ScriptRunner */ {};
