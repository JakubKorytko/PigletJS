/** @import {StateInterface, Member} from "@jsdocs/browser/classes/State.d" */

/**
 * @template T
 * @implements {StateInterface<T>}
 */
class State {
  _state;
  __observers = [];
  __isCreatedByListener;
  _isRef;

  constructor(initialValue, isCreatedByListener, asRef = false) {
    this._state = initialValue;
    this.__isCreatedByListener = isCreatedByListener;
    this._isRef = asRef;
  }

  /**
   * @type {Member["addObserver"]["Type"]}
   * @returns {Member["addObserver"]["ReturnType"]}
   */
  addObserver(observer) {
    this.__observers.push(observer);
  }

  /**
   * @type {Member["removeObserver"]["Type"]}
   * @returns {Member["removeObserver"]["ReturnType"]}
   */
  removeObserver(observer) {
    this.__observers = this.__observers.filter((obs) => obs !== observer);
  }

  /**
   * @type {Member["state"]["Type"]}
   * @returns {Member["state"]["ReturnType"]}
   */
  get state() {
    return this._state;
  }

  /**
   * @type {Member["setState"]["Type"]}
   * @returns {Member["setState"]["ReturnType"]}
   */
  setState(newState) {
    const oldState = this._state;
    this._state = newState;
    if (!this._isRef) {
      this._notify(oldState);
    }
  }

  /**
   * @type {Member["_notify"]["Type"]}
   * @returns {Member["_notify"]["ReturnType"]}
   */
  _notify(oldState) {
    this.__observers.forEach((observer) =>
      observer.stateChange(this._state, oldState),
    );
  }
}

export default State;
