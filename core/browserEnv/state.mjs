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
    const oldState = this._state;
    this._state = newState;
    this._notify(oldState);
  }

  _notify(oldState) {
    this._observers.forEach((observer) =>
      observer.stateChange(this._state, oldState),
    );
  }
}

const useState = (componentName, path, initialValue) => {
  if (!window.Piglet.state[componentName]) {
    window.Piglet.state[componentName] = {};
  }

  const key = Array.isArray(path) ? path.join(".") : path;

  if (!window.Piglet.state[componentName][key]) {
    window.Piglet.state[componentName][key] = new State(initialValue);
  }

  return {
    get value() {
      return window.Piglet.state[componentName][key].state;
    },
    set value(newValue) {
      window.Piglet.state[componentName][key].setState(newValue);
    },
  };
};

function useObserver(componentName, path) {
  const key = Array.isArray(path) ? path.join(".") : path;

  if (
    !window.Piglet.state[componentName] ||
    !window.Piglet.state[componentName][key]
  ) {
    return [() => {}, () => {}];
  }

  const state = window.Piglet.state[componentName][key];

  return [state.addObserver.bind(state), state.removeObserver.bind(state)];
}

export { useState, useObserver };
