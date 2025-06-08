/** @import {StateInterface, StateMembers} from "@jsdocs/browser/classes/State.d" */

import CONST from "@Piglet/browser/CONST";

const { nestedDeepProxyMarker, setViaGetterMarker } = CONST.symbols;

/**
 * @template T
 * @implements {StateInterface<T>}
 */
class State {
  /** @type {StateMembers["_state"]["Type"]} */
  _state;

  /** @type {StateMembers["__observers"]["Type"]} */
  __observers = [];

  /** @type {StateMembers["_isRef"]["Type"]} */
  _isRef;

  constructor(initialValue, asRef = false, avoidClone = false) {
    this._avoidClone = avoidClone;
    this._state =
      initialValue?.[1] === nestedDeepProxyMarker
        ? initialValue[0]
        : this.cloneState(initialValue);
    this._isRef = asRef;
  }

  /**
   * @type {StateMembers["addObserver"]["Type"]}
   * @returns {StateMembers["addObserver"]["ReturnType"]}
   */
  addObserver(observer) {
    this.__observers.push(observer);
  }

  /**
   * @type {StateMembers["removeObserver"]["Type"]}
   * @returns {StateMembers["removeObserver"]["ReturnType"]}
   */
  removeObserver(observer) {
    this.__observers = this.__observers.filter((obs) => obs !== observer);
  }

  /** @returns {StateMembers["_state"]["Type"]} */
  get state() {
    return this._state;
  }

  /**
   * @type {StateMembers["setState"]["Type"]}
   * @returns {StateMembers["setState"]["ReturnType"]}
   */
  setState(newState) {
    const oldState = this._state;

    this._state =
      newState?.[1] === nestedDeepProxyMarker
        ? newState[0]
        : this.cloneState(newState);
    if (!this._isRef) {
      this._notify(oldState);
    } else {
      this._notifyRef(oldState);
    }
  }

  /**
   * @type {StateMembers["cloneState"]["Type"]}
   * @returns {StateMembers["cloneState"]["ReturnType"]}
   */
  cloneState(state) {
    if (this._avoidClone || state === setViaGetterMarker) {
      return state;
    }

    let clone = state;

    try {
      clone = structuredClone(state);
    } catch (error) {
      console.pig(CONST.pigletLogs.cloneWarning, CONST.coreLogsLevels.warn, {
        error,
        state,
      });
    }

    return clone;
  }

  /**
   * @type {StateMembers["_notify"]["Type"]}
   * @returns {StateMembers["_notify"]["ReturnType"]}
   */
  _notify(oldState) {
    this.__observers.forEach((observer) =>
      observer.stateChange(this._state, oldState),
    );
  }

  /**
   * @type {StateMembers["_notifyRef"]["Type"]}
   * @returns {StateMembers["_notifyRef"]["ReturnType"]}
   */
  _notifyRef(oldState) {
    this.__observers.forEach((observer) => {
      if (typeof observer.refChange === "function") {
        observer.refChange(this._state, oldState);
      }
    });
  }
}

export default State;
