/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * @template T
 * @typedef {{
 * stateChange: function(T, T): void,
 * refChange?: function(T, T): void
 * }} Observer
 */

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
   * @type {Array<Observer<T>>}
   */
  __observers;

  /**
   * Whether the state is a reference
   * @type {boolean}
   */
  _isRef;

  /**
   * Adds an observer to the state
   * @param {Observer<T>} observer - The observer to add
   * @returns {void}
   */
  addObserver(observer) {}

  /**
   * Removes an observer from the state
   * @param {Observer<T>} observer - The observer to remove
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
   * Returns a clone of passed state value.
   * @param {T} state - The state to clone
   * @returns {T} - The cloned state
   */
  cloneState(state) {}

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

/** @typedef {InterfaceMethodTypes<StateInterface>} StateMembers */

export {
  /** @exports StateMembers */
  StateInterface,
};
