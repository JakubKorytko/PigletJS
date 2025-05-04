import { ReactiveComponent } from "./ReactiveComponent";
import { State } from "./hooks";

// Type definition for a tree node in the component tree
interface TreeNode<T> {
  tag: string | null; // HTML tag of the component
  componentName?: string | null; // Name of the component
  componentId?: number | null; // Component ID
  key: string | null; // Unique key for the node
  state?: Record<string, State<T>>; // State of the component
  children: Record<string, TreeNode<T>>; // Child nodes (subcomponents)
  element?: T; // The element associated with the node (e.g., HTMLElement)
}

// Definition of mount data for a component
interface MountData {
  key: string; // Unique key for the component
  tag: string; // HTML tag of the component
  ref: ReactiveComponent; // Reference to the ReactiveComponent instance
}

// Function to assign a unique ID to a component
declare function assignComponentIdToElement(el: ReactiveComponent): number;

// Function to build a tree of custom elements based on the root element
declare function buildCustomElementTree<T>(
  root?: HTMLElement,
): Record<string, TreeNode<T>>;

// Function to inject tree tracking into a component class
declare function injectTreeTrackingToComponentClass(
  targetClass: typeof ReactiveComponent,
): void;

export {
  assignComponentIdToElement,
  buildCustomElementTree,
  injectTreeTrackingToComponentClass,
  TreeNode,
  MountData,
};
