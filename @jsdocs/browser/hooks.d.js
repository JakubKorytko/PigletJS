/**
 * @template T - The type of the state value.
 * @typedef {{
 *   value: T // State value
 * }} StateValue
 * Represents a state value with a generic type.
 */

/**
 * @typedef {string|string[]} StatePath
 * A path representing a state in a component. Can be a single string or an array of strings.
 */

/**
 * @template T - The type of the state value.
 * @callback ObserverFn
 * Observer function that handles state changes.
 * @param {{stateChange: function(T, T): void}} observer - The observer object that can react to state changes.
 * @returns {void}
 */

/**
 * @template T - The type of the state value.
 * @typedef {[addObserver: ObserverFn<T>, removeObserver: ObserverFn<T>]} ObserverTuple
 * A tuple containing functions to add and remove observers for a specific state.
 */

/**
 * @template T - The type of the state value.
 * @typedef {(
 *   componentName: string, // Component name
 *   path: StatePath, // State path
 *   initialValue?: T, // Initial value
 *   isCreatedByListener?: boolean, // Whether the state was created by a listener
 *   asRef?: boolean // Whether the state is a ref
 * ) => StateValue<T>} UseState
 * Hook to manage state in a component, providing access to the current value and the ability to observe it.
 */

/**
 * @template T - The type of the state value.
 * @typedef {(
 *   componentName: string, // Component name
 *   path: StatePath // State path
 * ) => ObserverTuple<T>} UseObserver
 * Hook to manage observers for a state in a component.
 */

export default {
  /** @exports UseState */
  /** @exports UseObserver */
  /** @exports StateValue */
  /** @exports StatePath */
  /** @exports ObserverFn */
  /** @exports ObserverTuple */
};
