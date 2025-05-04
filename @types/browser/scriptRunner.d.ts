import { ReactiveComponent } from "@Piglet/browser/classes/ReactiveComponent";
import { TreeNode } from "@jsdocs/browser/tree.d";

// Proxy for an element with event listener methods and updates
export interface ElementProxy {
  on(event: string, callback: Function): ElementProxy; // Add an event listener
  off(event: string, callback: Function): ElementProxy; // Remove an event listener
  clearListeners(): ElementProxy; // Clear all event listeners
  pass(updates: Record<string, any>): ElementProxy; // Pass updates to the element
}

// Query for an element within a host component
export type QueryElement = (
  hostElement: ReactiveComponent,
  selector: string,
) => ElementProxy;

// Context object containing element, state, and variables for script execution
export interface ScriptContext {
  element: HTMLElement; // The element the script operates on
  state: any; // The state of the element
  [key: string]: any; // Additional properties for script context
}

// Result of running a script, including success status and potential errors
export interface ScriptResult {
  success: boolean; // Whether the script execution was successful
  error?: Error; // Error encountered, if any
  result?: any; // The result of the script execution
}

// Executes a script within a given context
export function runScript(
  script: string,
  context: ScriptContext,
): Promise<ScriptResult>;

// Evaluates an expression within the given script context
export function evaluateExpression(
  expression: string,
  context: ScriptContext,
): any;

// Creates a script context from an HTML element
export function createScriptContext(element: HTMLElement): ScriptContext;

// Clears all event listeners from a host element
export function clearAllListenersForHost(hostElement: ReactiveComponent): void;

// Retrieves component data for a host element
export function getComponentData(hostElement: ReactiveComponent): ComponentData;

// Cleans up after a component is mounted, including removing event listeners
export function componentMountCleanup(
  hostElement: ReactiveComponent,
  callbacks: ComponentData["callbacks"],
): void;

// Runs a script on a component, passing the reason for the script execution
export function scriptRunner(
  hostElement: ReactiveComponent,
  module: any,
  scriptReason: string,
): void;

// Contains the data related to a component's state, attributes, and lifecycle callbacks
export interface ComponentData {
  component: {
    name: string; // Component name
    id: number; // Component ID
    tree: Record<string, TreeNode<ReactiveComponent | Element>>; // Component tree
    shadowRoot: ShadowRoot | null; // Shadow root of the component
    key: string; // Unique component key
    state: Function; // State function
    element: ReactiveComponent; // Component element
    parent: ReactiveComponent | null | Element; // Parent element of the component
    attributes: Record<string, any> | {}; // Component attributes
    forwarded: Record<string, Function> | {}; // Forwarded functions for the component
  };
  callbacks: {
    element: QueryElement; // Element query method
    $onBeforeUpdate: (callback: () => boolean | void) => void; // Before update callback
    $onAfterUpdate: (callback: () => void) => void; // After update callback
    onAfterUpdateRef: { value: () => void }; // After update reference callback
    onBeforeUpdateRef: { value: () => boolean | void }; // Before update reference callback
  };
}
