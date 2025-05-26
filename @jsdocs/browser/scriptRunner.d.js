/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */
/**
 * @typedef {{
 *   on: (event: string, callback: Function, options?: boolean | AddEventListenerOptions) => ElementProxy,  // Add an event listener
 *   off: (event: string, callback: Function) => ElementProxy,  // Remove an event listener
 *   clearListeners: () => ElementProxy,  // Clear all event listeners
 *   pass: (updates: Record<string, *>) => ElementProxy  // Pass updates to the element
 *   clone: () => ReactiveComponent | HTMLElement,  // Clone the element
 * }} ElementProxy
 * Represents a proxy for an element with event listener methods and updates.
 */

/**
 * @typedef {(hostElement: ReactiveComponent, selectorOrNode: string|HTMLElement) => ElementProxy} QueryElement
 * Query for an element within a host component.
 */

/**
 * @typedef {(hostElement: ReactiveComponent, selector: string) => ElementProxy[]} QueryElements
 * Query for multiple elements within a host component.
 */

/**
 * @typedef {(hostElement: ReactiveComponent) => void} ClearAllListenersForHost
 * Clears all event listeners from a host element.
 */

/**
 * @typedef {(hostElement: ReactiveComponent, callbacks: ComponentData["callbacks"]) => void} ComponentMountCleanup
 * Cleans up after a component is mounted, including removing event listeners.
 */

/**
 * @typedef {(hostElement: ReactiveComponent, module: any, scriptReason: string) => void} ScriptRunner
 * Runs a script on a component, passing the reason for the script execution.
 */

/**
 * @typedef {{
 *   component: {
 *     $attrs: Record<string, *> | {},  // Component attributes
 *     $P: Record<string, any>, // Component state
 *     $B: Record<string, any>, // Component refs
 *     $$: (initialValue: any) => {__piglet_use_marker: true, initialValue},  // State initialization
 *     $$P: Record<string, any>, // Component deep state
 *     $: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement // Template literal for creating elements
 *   },
 *   callbacks: {
 *     $element: QueryElement,  // Element query method
 *     $elements: QueryElements,  // Elements query method
 *     $onBeforeUpdate: (callback: () => boolean|void) => void,  // Before update callback
 *     $onAfterUpdate: (callback: () => void) => void,  // After update callback
 *     onAfterUpdateRef: { value: () => void },  // After update reference callback
 *     onBeforeUpdateRef: { value: () => boolean|void },  // Before update reference callback
 *   }
 * }} ComponentData
 * Contains the data related to a component's state, attributes, and lifecycle callbacks.
 */

/**
 * @typedef {(hostElement: ReactiveComponent) => ComponentData} GetComponentData
 */

export /** @exports ComponentData */
/** @exports ElementProxy */
/** @exports QueryElement */
/** @exports QueryElements */
/** @exports ClearAllListenersForHost */
/** @exports GetComponentData */
/** @exports ComponentMountCleanup */
/** @exports ScriptRunner */ {};
