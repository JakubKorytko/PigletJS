/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * A base class for reactive web components in the Piglet framework.
 * Handles state management, lifecycle hooks, and component tree tracking.
 * @interface ReactiveDummyComponentInterface
 */
class ReactiveDummyComponentInterface {
  /**
   * The observers of the component state
   * @type {Map<string, (component: ReactiveComponent) => void>}
   */
  __observers;

  /**
   * Called when the component is connected to the DOM
   * @returns {void}
   */
  connectedCallback() {}

  /**
   * Observe a state property
   * @param {string} property - The property to observe
   * @returns {void}
   */
  observeState(property) {}

  /**
   * Called when the state of the component changes
   * @template T - The type of the state value.
   * @param {T} value - The new value of the state
   * @param {string} property - The property that changed
   * @param {T} prevValue - The previous value of the state
   * @returns {void}
   */
  stateChange(value, property, prevValue) {}

  /**
   * Called when the ref used in the component changes
   * @param value - The new value of the ref
   * @param property - The property that changed
   * @param prevValue - The previous value of the ref
   */
  refChange(value, property, prevValue) {}
}

/** @typedef {InterfaceMethodTypes<ReactiveDummyComponentInterface>} Member */

export {
  /** @exports Member */
  ReactiveDummyComponentInterface,
};
