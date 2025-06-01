/** @import {UseState, UseObserver, StateValue} from "@jsdocs/browser/hooks.d" */
import { sendToExtension } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import State from "@Piglet/browser/classes/State";

/**
 * @template T
 * @type {UseState<T>}
 */
const useState = (
  componentName,
  path,
  initialValue,
  asRef,
  avoidClone = false,
  root,
) => {
  if (!root.globalState[componentName]) {
    root.globalState[componentName] = {};
  }

  const key = Array.isArray(path) ? path.join(".") : path;

  if (!root.globalState[componentName][key]) {
    root.globalState[componentName][key] = new State(
      initialValue,
      asRef,
      avoidClone,
    );
  }

  /**
   * @template T
   * @type {StateValue<T>}
   */
  return {
    /**
     * Gets the current state value.
     */
    get value() {
      return root.globalState[componentName][key].state;
    },

    /**
     * Sets a new state value and triggers state update.
     */
    set value(newValue) {
      root.globalState[componentName][key].setState(newValue);
      sendToExtension(CONST.extension.state, root);
    },
  };
};

/**
 * @template T
 * @type {UseObserver<T>}
 */
const useObserver = function (componentName, path, root) {
  const key = Array.isArray(path) ? path.join(".") : path;

  if (
    !root.globalState[componentName] ||
    !root.globalState[componentName][key]
  ) {
    return [() => {}, () => {}];
  }

  const state = root.globalState[componentName][key];

  return [state.addObserver.bind(state), state.removeObserver.bind(state)];
};

export { useState, useObserver };
