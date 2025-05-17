export interface StateInterface<T> {
  _state: T;
  __observers: Array<{ stateChange(newState: T, oldState: T): void }>;
  _isRef: boolean;

  addObserver(observer: { stateChange(newState: T, oldState: T): void }): void;
  removeObserver(observer: {
    stateChange(newState: T, oldState: T): void;
  }): void;
  get state(): T;
  setState(newState: T): void;
  _notify(oldState: T): void;
  _notifyRef(oldState: T): void;
}
