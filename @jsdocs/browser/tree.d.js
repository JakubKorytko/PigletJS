/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */

/**
 * @typedef {{
 *   key: string,  // Unique key of the component
 *   tag: string,  // HTML tag of the component
 *   ref: ReactiveComponent  // Reference to the component
 * }} MountData
 * Contains mount data for a component, including the key, tag, and reference to the component.
 */

/**
 * @template T
 * @typedef {Record<string, string | T>} StringRecord<T>
 * A record of strings and other records
 */

/**
 * @typedef {StringRecord<StringRecord<string>>} TreeNode
 * A tree node is a record of strings and other tree nodes
 */

/**
 * @typedef {(node: ReactiveComponent) => Record<string, TreeNode>} BuildComponentTree
 * Builds a tree of components from a root component
 */

/**
 * @typedef {(node: ReactiveComponent | Element) => string} GetNodeKey
 * Gets the key of a node
 */

/**
 * @typedef {(currentNode: ReactiveComponent | Element) => TreeNode|{}} Recurse
 * Recursively builds the tree
 */

export default {
  /** @exports MountData */
  /** @exports BuildComponentTree */
  /** @exports TreeNode */
  /** @exports GetNodeKey */
  /** @exports Recurse */
};
