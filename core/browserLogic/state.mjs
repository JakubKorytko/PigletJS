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
    this._observers.forEach((observer) => observer.stateChange(this._state));
  }
}

window.AppState = {};

const useState = (componentName, path, initialValue) => {
  if (!window.AppState[componentName]) {
    window.AppState[componentName] = {};
  }

  const key = Array.isArray(path) ? path.join(".") : path;

  if (!window.AppState[componentName][key]) {
    window.AppState[componentName][key] = new State(initialValue);
  }

  return {
    get value() {
      return window.AppState[componentName][key].state;
    },
    set value(newValue) {
      window.AppState[componentName][key].setState(newValue);
    },
  };
};

function useObserver(componentName, path) {
  const key = Array.isArray(path) ? path.join(".") : path;

  if (!window.AppState[componentName] || !window.AppState[componentName][key]) {
    return [() => {}, () => {}];
  }

  const state = window.AppState[componentName][key];

  return [state.addObserver.bind(state), state.removeObserver.bind(state)];
}

export { useState, useObserver };
