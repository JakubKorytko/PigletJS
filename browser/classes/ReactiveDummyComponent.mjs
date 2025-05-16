import { getHost } from "@Piglet/browser/helpers";
import { useObserver } from "@Piglet/browser/hooks";

class ReactiveDummyComponent extends HTMLElement {
  __observers = new Map();

  connectedCallback() {
    this.style.display = "contents";
    this._parent = getHost(this, true);
    const parent = this._parent?.internal;

    if (parent?.mounted) {
      this._mount();
    } else {
      parent.waiters.push(this);
    }
  }

  observeState(property) {
    const callback = {
      stateChange: (value, prevValue) =>
        this.stateChange(value, property, prevValue),
    };

    const [addObserver, removeObserver] = useObserver(
      this._parent.__componentKey,
      property,
    );

    if (this.__observers.has(property)) {
      const oldRemove = this.__observers.get(property);
      oldRemove?.(this);
    }

    addObserver(callback);
    this.__observers.set(property, () => removeObserver(callback));
  }

  stateChange(value, property, prevValue) {
    if (prevValue !== value) {
      this._update(value, property, prevValue);
    }
  }
}

export default ReactiveDummyComponent;
