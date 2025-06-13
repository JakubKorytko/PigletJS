/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import State from "@Piglet/browser/classes/State" */

/**
 * @interface HerdInterface
 */
class HerdInterface {
  /**
   * Map of all managed states
   * @type {Object.<string, unknown>}
   */
  states;

  /**
   * Proxy for global state access
   * @type {Object.<string, unknown>}
   */
  globalState;

  /**
   * Map for tracking observer waiters
   * @type {Map<string, ReactiveComponent[]>}
   */
  observerWaiters;

  /**
   * Map of registered observers
   * @type {Map<string, function(target: HerdInterface): void>}
   */
  observers;

  /**
   * Pseudo component key for global state
   * @type {string}
   */
  __componentKey;

  /**
   * Component name
   * @type {string}
   */
  __componentName;

  /**
   * Cache for proxies
   * @type {WeakMap<any, any>}
   */
  __proxyCache;

  /**
   * Function that creates shallow state proxy for a component
   * @type {function(ReactiveComponent): Object}
   */
  shallow;

  /**
   * Function that creates deep state proxy for a component
   * @type {function(ReactiveComponent): Object}
   */
  deep;

  /**
   * Reference to the root Herd instance
   * @type {HerdInterface}
   */
  root;

  /**
   * Creates or retrieves a state at the specified path
   * @template T
   * @param {string|string[]} path - Key or path array for the state
   * @param {T} initialValue - Initial value for the state
   * @param {boolean} [asRef=false] - Whether to store by reference
   * @param {boolean} [avoidClone=false] - Whether to avoid cloning values
   * @returns {{value: T}} State object with getter/setter for value property
   */
  state(path, initialValue, asRef, avoidClone) {}

  /**
   * Registers a component to observe changes in a state path
   * @param {ReactiveComponent} componentInstance - Component that will observe the state
   * @param {string|string[]} path - Path to the state to observe
   * @returns {void}
   */
  observe(componentInstance, path) {}

  /**
   * Removes a component's observer for a specific state property
   * @param {ReactiveComponent} componentInstance - Component to unregister
   * @param {string} property - Property path to stop observing
   * @returns {void}
   */
  unobserve(componentInstance, property) {}
}

/** @typedef {InterfaceMethodTypes<HerdInterface>} HerdInterfaceMembers */
/** @typedef {{component: ReactiveComponent, herd: Herd, originalProxy: Proxy}} ObserverProxyTarget */

export {
  /** @exports HerdInterfaceMembers */
  /** @exports ObserverProxyTarget */
  HerdInterface,
};
