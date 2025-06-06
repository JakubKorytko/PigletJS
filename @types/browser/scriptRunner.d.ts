import { ReactiveComponent } from "@Piglet/browser/classes/ReactiveComponent";
import type { Navigate, api } from "./helpers.d";

// Proxy for an element with event listener methods and updates
export interface ElementProxy {
  on(
    event: string,
    callback: Function,
    options?: boolean | AddEventListenerOptions,
  ): ElementProxy; // Add an event listener
  off(event: string, callback: Function): ElementProxy; // Remove an event listener
  clearListeners(): ElementProxy; // Clear all event listeners
  pass(updates: Record<string, any>): ElementProxy; // Pass updates to the element
  clone(): ReactiveComponent | HTMLElement; // Clone the element
}

// Query for an element within a host component
export type QueryElement = (
  hostElement: ReactiveComponent,
  selectorOrNode: string | HTMLElement,
) => ElementProxy;

// Query for multiple elements within a host component
export type QueryElements = (
  hostElement: ReactiveComponent,
  selector: string,
) => ElementProxy[];

// Clears all event listeners from a host element
export declare function clearAllListenersForHost(
  hostElement: ReactiveComponent,
): void;

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
    $attrs: Record<string, unknown> | {}; // Component attributes
    $P: Record<string, any>; // Component state
    $B: Record<string, any>; // Component refs
    $$: (initialValue: any) => { __piglet_use_marker: true; initialValue: any }; // State initialization
    $$P: Record<string, any>; // Component deep state
    $: (strings: TemplateStringsArray, ...values: any[]) => HTMLElement; // Template literal for creating elements
    $navigate: Navigate; // Navigate to a route
    $api: api; // API for making requests
    $types: ReactiveComponent["types"]; // Types for the component
  };
  callbacks: {
    $element: QueryElement; // Element query method
    $elements: QueryElements; // Query elements within the component
    $onBeforeUpdate: (callback: () => boolean | void) => void; // Before update callback
    $onAfterUpdate: (callback: () => void) => void; // After update callback
    onAfterUpdateRef: { value: () => void }; // After update reference callback
    onBeforeUpdateRef: { value: () => boolean | void }; // Before update reference callback
  };
}

export function getComponentData(hostElement: ReactiveComponent): ComponentData; // Retrieves component data for a given host element
