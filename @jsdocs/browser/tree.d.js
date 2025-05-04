/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {StateInterface} from "@jsdocs/browser/classes/State.d" */
/** @import {TreeNode} from "@jsdocs/browser/tree.d" */

/**
 * @template T
 * @typedef {{
 *   tag: string|null,  // HTML tag of the component
 *   componentName?: string|null,  // Name of the component
 *   componentId?: number|null,  // Unique ID of the component
 *   key: string|null,  // Unique key for the node
 *   state?: Record<string, StateInterface<T>>|{},  // Component state
 *   children: Record<string, TreeNode<T>>|{},  // Child nodes
 *   element?: T  // The element associated with the node
 * }} TreeNode
 * Represents a node in a component tree, holding component data and state.
 */

/**
 * @typedef {{
 *   key: string,  // Unique key of the component
 *   tag: string,  // HTML tag of the component
 *   ref: ReactiveComponent  // Reference to the component
 * }} MountData
 * Contains mount data for a component, including the key, tag, and reference to the component.
 */

/**
 * @typedef {(el: ReactiveComponent) => number} AssignComponentIdToElement
 * Assigns a unique component ID to an element.
 */

/**
 * @template T
 * @typedef {(root?: HTMLElement) => Record<string, TreeNode<T>>|{}} BuildCustomElementTree
 * Builds a custom element tree from a given root HTML element.
 */

/**
 * @typedef {(targetClass: typeof ReactiveComponent) => void} InjectTreeTrackingToComponentClass
 * Injects tree tracking functionality into a component class.
 */

/**
 * @template T, R
 * @typedef {(node: T) => TreeNode<R> | null} Walk
 * Traverses a node and returns its tree node representation.
 */

export default {
  /** @exports TreeNode */
  /** @exports MountData */
  /** @exports AssignComponentIdToElement */
  /** @exports BuildCustomElementTree */
  /** @exports InjectTreeTrackingToComponentClass */
  /** @exports Walk */
};
