class State {
  constructor(initialValue) {
    this._state = initialValue;
    this._observers = [];
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  removeObserver(observer) {
    this._observers = this._observers.filter((obs) => obs !== observer);
  }

  get state() {
    return this._state;
  }

  setState(newState) {
    this._state = newState;
    this._notify();
  }

  _notify() {
    this._observers.forEach((observer) => observer.update(this._state));
  }
}

const globalStates = {};

const useState = (componentName, path) => {
  if (!globalStates[componentName]) {
    globalStates[componentName] = {};
  }

  const key = Array.isArray(path) ? path.join(".") : path;

  if (!globalStates[componentName][key]) {
    globalStates[componentName][key] = new State();
  }

  return {
    get value() {
      return globalStates[componentName][key].state;
    },
    set value(newValue) {
      globalStates[componentName][key].setState(newValue);
    },
  };
};

function useObserver(componentName, path) {
  const key = Array.isArray(path) ? path.join(".") : path;

  if (!globalStates[componentName] || !globalStates[componentName][key]) {
    return [() => {}, () => {}];
  }

  const state = globalStates[componentName][key];

  return [state.addObserver.bind(state), state.removeObserver.bind(state)];
}
