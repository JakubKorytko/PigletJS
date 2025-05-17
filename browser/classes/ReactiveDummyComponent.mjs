/** @import {ReactiveDummyComponentInterface, Member} from "@Piglet/browser/classes/ReactiveDummyComponent.d" */

import { getHost } from "@Piglet/browser/helpers";
import { useObserver } from "@Piglet/browser/hooks";

/** @implements {ReactiveDummyComponentInterface} */
class ReactiveDummyComponent extends HTMLElement {
  __observers = new Map();
  #pendingStateUpdate = false;
  #pendingRefUpdate = false;

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
      refChange: (value, prevValue) =>
        this.refChange(value, property, prevValue),
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
    if (!this.#pendingStateUpdate) {
      this.#pendingStateUpdate = true;
      Promise.resolve().then(() => {
        this.#pendingStateUpdate = false;

        if (
          prevValue !== value ||
          (typeof value === "object" && value !== null)
        ) {
          this._update(value, property, prevValue);
        }
      });
    }
  }

  refChange(value, property, prevValue) {
    if (!this.#pendingRefUpdate) {
      this.#pendingRefUpdate = true;
      Promise.resolve().then(() => {
        this.#pendingRefUpdate = false;

        if (
          prevValue !== value ||
          (typeof value === "object" && value !== null)
        ) {
          this._refUpdate(value, property, prevValue);
        }
      });
    }
  }

  dispatchEvent(event) {
    return false;
  }
}

export default ReactiveDummyComponent;
