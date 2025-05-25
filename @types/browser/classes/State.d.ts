type Observer<T> = {
  stateChange(newState: T, oldState: T): void;
  refChange?: (newState: T, oldState: T) => void;
};

export interface StateInterface<T> {
  _state: T;
  __observers: Array<Observer<T>>;
  _isRef: boolean;

  addObserver(observer: Observer<T>): void;
  removeObserver(observer: Observer<T>): void;
  get state(): T;
  setState(newState: T): void;
  cloneState(state: T): T;
  _notify(oldState: T): void;
  _notifyRef(oldState: T): void;
}
