export interface StateInterface<T> {
  _state: T;
  __observers: Array<{ stateChange(newState: T, oldState: T): void }>;
  __isCreatedByListener: boolean;
  _isRef: boolean;

  addObserver(observer: { stateChange(newState: T, oldState: T): void }): void;
  removeObserver(observer: {
    stateChange(newState: T, oldState: T): void;
  }): void;
  get state(): T;
  setState(newState: T): void;
  _notify(oldState: T): void;
}

export type Member = {
  addObserver: {
    Type: <T>(observer: {
      stateChange(newState: T, oldState: T): void;
    }) => void;
    ReturnType: void;
  };
  removeObserver: {
    Type: <T>(observer: {
      stateChange(newState: T, oldState: T): void;
    }) => void;
    ReturnType: void;
  };
  state: {
    Type: <T>() => T;
    ReturnType: T;
  };
  setState: {
    Type: <T>(newState: T) => void;
    ReturnType: void;
  };
  _notify: {
    Type: <T>(oldState: T) => void;
    ReturnType: void;
  };
};
