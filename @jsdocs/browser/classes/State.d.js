/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * @interface StateInterface
 * @template T - The type of the state value.
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
  __observers;

  /**
   * Whether the state is a reference
   * @type {boolean}
   */
  _isRef;

  /**
   * Adds an observer to the state
   * @param {{stateChange: function(T, T): void}} observer - The observer to add
   * @returns {void}
   */
  addObserver(observer) {}

  /**
   * Removes an observer from the state
   * @param {{stateChange: function(T, T): void}} observer - The observer to remove
   * @returns {void}
   */
  removeObserver(observer) {}

  /**
   * Gets the current state value
   * @returns {T}
   */
  get state() {
    return this._state;
  }

  /**
   * Sets a new value for the state and notifies observers
   * @param {T} newState - The new value of the state
   * @returns {void}
   */
  setState(newState) {}

  /**
   * Notifies all observers about a state change
   * @param {T} oldState - The previous value of the state
   * @returns {void}
   */
  _notify(oldState) {}

  /**
   * Notifies all observers about a reference change
   * @param {T} oldState
   * @returns {void}
   */
  _notifyRef(oldState) {}
}

/** @typedef {InterfaceMethodTypes<StateInterface>} Member */

export {
  /** @exports Member */
  StateInterface,
};
