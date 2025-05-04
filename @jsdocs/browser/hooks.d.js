/**
 * Represents a state value with a generic type.
 * @template T
 * @typedef {{
 *   value: T
 * }} StateValue
 */

/**
 * A path representing a state in a component. Can be a single string or an array of strings.
 * @typedef {string|string[]} StatePath
 */

/**
 * Observer function that handles state changes.
 * @template T
 * @callback ObserverFn
 * @param {{stateChange: function(T, T): void}} observer - The observer object that can react to state changes.
 * @returns {void}
 */

/**
 * A tuple containing functions to add and remove observers for a specific state.
 * @template T
 * @typedef {[addObserver: ObserverFn<T>, removeObserver: ObserverFn<T>]} ObserverTuple
 */

/**
 * Hook to manage state in a component, providing access to the current value and the ability to observe it.
 * @template T
 * @typedef {(
 *   componentName: string,
 *   path: StatePath,
 *   initialValue?: T,
 *   isCreatedByListener?: boolean,
 *   asRef?: boolean
 * ) => StateValue<T>} UseState
 */

/**
 * Hook to manage observers for a state in a component.
 * @template T
 * @typedef {(
 *   componentName: string,
 *   path: StatePath
 * ) => ObserverTuple<T>} UseObserver
 */

export default {
  /** @exports UseState */
  /** @exports UseObserver */
  /** @exports StateValue */
  /** @exports StatePath */
  /** @exports ObserverFn */
  /** @exports ObserverTuple */
};
