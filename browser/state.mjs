import { sendToExtension } from "@Piglet/browser/extension";

/**
 * Class representing a state with observer pattern.
 */
class State {
  /**
   * Creates an instance of the State class.
   * @param {*=} initialValue - The initial value for the state.
   */
  constructor(initialValue) {
    this._state = initialValue;
    this._observers = [];
  }

  /**
   * Adds an observer to the state.
   * The observer will be notified on state change.
   * @param {Object} observer - The observer object that has a `stateChange` method.
   */
  addObserver(observer) {
    this._observers.push(observer);
  }

  /**
   * Removes an observer from the state.
   * @param {Object} observer - The observer object to remove.
   */
  removeObserver(observer) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  /**
   * Gets the current state value.
   * @returns {*} The current state value.
   */
  get state() {
    return this._state;
  }

  /**
   * Sets a new value for the state and notifies observers.
   * @param {*} newState - The new state value.
   */
  setState(newState) {
    const oldState = this._state;
    this._state = newState;
    this._notify(oldState);
  }

  /**
   * Notifies all observers about a state change.
   * @param {*} oldState - The previous state value.
   * @private
   */
  _notify(oldState) {
    this._observers.forEach((observer) =>
      observer.stateChange(this._state, oldState),
    );
  }
}

/**
 * A hook-like function for managing component state.
 *
 * @param {string} componentName - The name of the component managing the state.
 * @param {string|Array} path - The path to the state within the component.
 * @param {*=} initialValue - The initial state value.
 * @returns {Object} An object with `value` getter and setter for managing state.
 */
const useState = (componentName, path, initialValue) => {
  if (!window.Piglet.state[componentName]) {
    window.Piglet.state[componentName] = {};
  }

  const key = Array.isArray(path) ? path.join(".") : path;

  if (!window.Piglet.state[componentName][key]) {
    window.Piglet.state[componentName][key] = new State(initialValue);
  }

  return {
    /**
     * Gets the current state value.
     * @returns {*} The current state value.
     */
    get value() {
      return window.Piglet.state[componentName][key].state;
    },

    /**
     * Sets a new state value and triggers state update.
     * @param {*} newValue - The new state value to set.
     */
    set value(newValue) {
      sendToExtension("state");
      window.Piglet.state[componentName][key].setState(newValue);
    },
  };
};

/**
 * A function to get observers' add and remove methods for state.
 *
 * @param {string} componentName - The name of the component managing the state.
 * @param {string|Array} path - The path to the state within the component.
 * @returns {[Function, Function]} An array with two functions: one for adding an observer and one for removing an observer.
 */
function useObserver(componentName, path) {
  const key = Array.isArray(path) ? path.join(".") : path;

  if (
    !window.Piglet.state[componentName] ||
    !window.Piglet.state[componentName][key]
  ) {
    return [() => {}, () => {}];
  }

  const state = window.Piglet.state[componentName][key];

  return [state.addObserver.bind(state), state.removeObserver.bind(state)];
}

export { useState, useObserver };
