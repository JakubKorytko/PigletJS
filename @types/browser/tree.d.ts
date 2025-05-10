import { ReactiveComponent } from "./ReactiveComponent";

// Definition of mount data for a component
interface MountData {
  key: string; // Unique key for the component
  tag: string; // HTML tag of the component
  ref: ReactiveComponent; // Reference to the ReactiveComponent instance
}

// Definition of a tree node
interface TreeNode {
  [key: string]: TreeNode | string;
}

// Builds a tree of components from a root component
type BuildComponentTree = (node: ReactiveComponent) => Record<string, TreeNode>;

// Gets the key of a node
type GetNodeKey = (node: ReactiveComponent | Element) => string;

// Recursively builds the tree
type Recurse = (currentNode: ReactiveComponent | Element) => TreeNode | {};

export type { MountData, TreeNode, BuildComponentTree, GetNodeKey, Recurse };
