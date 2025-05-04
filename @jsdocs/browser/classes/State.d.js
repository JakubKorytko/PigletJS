/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * @interface StateInterface
 * @template T
 */
class StateInterface {
  /**
   * The current state value
   * @type {T}
   */
  _state;

  /**
   * List of observers
   * @type {Array<{stateChange: function(T, T): void}>}
   */
  _observers;

  /**
   * Whether the state was created by a listener
   * @type {boolean}
   */
  __isCreatedByListener;

  /**
   * Whether the state is a reference
   * @type {boolean}
   */
  _isRef;

  /**
   * Adds an observer to the state
   * @param {{stateChange: function(T, T): void}} observer
   * @returns {void}
   */
  addObserver(observer) {}

  /**
   * Removes an observer from the state
   * @param {{stateChange: function(T, T): void}} observer
   * @returns {void}
   */
  removeObserver(observer) {}

  /**
   * Gets the current state value
   * @returns {T}
   */
  get state() {
    return null;
  }

  /**
   * Sets a new value for the state and notifies observers
   * @param {T} newState
   * @returns {void}
   */
  setState(newState) {}

  /**
   * Notifies all observers about a state change
   * @param {T} oldState
   * @returns {void}
   */
  _notify(oldState) {}
}

/** @typedef {InterfaceMethodTypes<StateInterface>} Member */

export {
  /** @exports Member */
  StateInterface,
};
