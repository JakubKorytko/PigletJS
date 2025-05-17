/** A path representing a state in a component. Can be a single string or an array of strings. */
export type StatePath = string | string[];

/** A value representing a state in a component. */
export interface StateValue<T> {
  value: T;
}

/** An observer function that handles state changes. */
export type ObserverFn<T> = (observer: {
  stateChange(newState: T, oldState: T): void;
}) => void;

/** A tuple containing functions to add and remove observers for a specific state. */
export type ObserverTuple<T> = [
  addObserver: ObserverFn<T>,
  removeObserver: ObserverFn<T>,
];

/** Hook to manage state in a component, providing access to the current value and the ability to observe it. */
export declare function useState<T>(
  componentName: string,
  path: StatePath,
  initialValue?: T,
  asRef?: boolean,
): StateValue<T>;

/** Hook to manage observers for a state in a component. */
export declare function useObserver<T>(
  componentName: string,
  path: StatePath,
): ObserverTuple<T>;
