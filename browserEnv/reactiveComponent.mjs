import { assignComponentIdToElement } from "@Piglet/browserEnv/treeTracking";
import { useState, useObserver } from "@Piglet/browserEnv/state";

class ReactiveComponent extends HTMLElement {
  constructor() {
    super();

    this._caller = this.getAttribute("host__element");
    this.removeAttribute("host__element");

    this._componentName = this.constructor.name;
    this._observers = new Map();
    this._attrs = {};
    this._forwarded = {};

    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const name = mutation.attributeName;
          const oldValue = mutation.oldValue;
          const newValue = this.getAttribute(name);

          this._attrs[name] = newValue;

          if (typeof this.onAttributeChange === "function") {
            this.onAttributeChange(newValue, name, oldValue);
            if (typeof this.reactive === "function") {
              this.reactive();
            }
          } else {
            Piglet.log(
              `[${this.__componentKey}] onAttributeChange not implemented for: ${name}`,
              "warn",
            );
          }
        }
      }
    });

    this._mutationObserver.observe(this, {
      attributes: true,
      attributeOldValue: true,
    });

    for (const attr of this.attributes) {
      this._attrs[attr.name] = attr.value;
    }

    if (this.constructor.name === "AppRoot") {
      this.__componentId = 0;
    } else {
      assignComponentIdToElement(this);
    }

    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  connectedCallback() {
    Piglet.log(`${this._componentName} connected`);
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this._caller) this._caller = this.__root.host.__componentKey;
  }

  observeState(property) {
    const callback = {
      stateChange: (value, prevValue) =>
        this.stateChange(value, property, prevValue),
    };

    const [addObserver, removeObserver] = useObserver(
      this._caller ?? this.__componentKey,
      property,
    );

    if (this._observers.has(property)) {
      const oldRemove = this._observers.get(property);
      oldRemove?.(this);
    }

    addObserver(callback);
    this._observers.set(property, () => removeObserver(callback));
  }

  state(property, initialValue) {
    const state = useState(
      this._caller ?? this.__componentKey,
      property,
      initialValue,
    );
    this.observeState(property);
    return state;
  }

  stateChange(value, property, prevValue) {
    if (typeof this.onStateChange === "function") {
      this.onStateChange(value, property, prevValue);
      if (typeof this.reactive === "function") {
        this.reactive();
      }
    } else {
      Piglet.log(
        `[${this._caller ?? this.__componentKey}] onStateChange not implemented for: ${property}`,
        "warn",
      );
    }
  }

  disconnectedCallback() {
    for (const remove of this._observers.values()) {
      remove?.(this);
    }
    this._observers.clear();
  }
}

export default ReactiveComponent;
