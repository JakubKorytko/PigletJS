import type ReactiveComponent from "./ReactiveComponent.d";

export interface HerdInterface {
  /** Map of all managed states */
  states: Record<string, unknown>;

  /** Proxy for global state access */
  globalState: Record<string, unknown>;

  /** Map for tracking observer waiters */
  observerWaiters: Map<string, ReactiveComponent[]>;

  /** Map of registered observers */
  observers: Map<string, (target: HerdInterface) => void>;

  /** Pseudo component key for global state */
  __componentKey: string;

  /** Component name */
  __componentName: string;

  /** Cache for proxies */
  __proxyCache: WeakMap<any, any>;

  /** Function that creates shallow state proxy for a component */
  shallow: (target: ReactiveComponent) => Object;

  /** Function that creates deep state proxy for a component */
  deep: (target: ReactiveComponent) => Object;

  /** Reference to the root Herd instance */
  root: HerdInterface;

  /**
   * Creates or retrieves a state at the specified path
   */
  state: ReactiveComponent.prototype.state;

  /**
   * Registers a component to observe changes in a state path
   */
  observe(componentInstance: ReactiveComponent, path: string | string[]): void;

  /**
   * Removes a component's observer for a specific state property
   */
  unobserve(componentInstance: ReactiveComponent, property: string): void;
}

export type ObserverProxyTarget = {
  component: ReactiveComponent;
  herd: HerdInterface;
  originalProxy: Proxy;
};
