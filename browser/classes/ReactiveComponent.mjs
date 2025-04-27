import { assignComponentIdToElement } from "@Piglet/browser/tree";
import { useState, useObserver } from "@Piglet/browser/state";

/**
 * Base class for custom elements with reactive state and attribute tracking.
 * Child components can optionally implement `onStateChange`, `onAttributeChange`, and `reactive`.
 */
class ReactiveComponent extends HTMLElement {
  constructor() {
    super();

    /** @public */
    this._caller = this.getAttribute("host__element");
    this.removeAttribute("host__element");

    /** @private */
    this._componentName = this.constructor.name;

    /** @public */
    this._observers = new Map();

    /** @public */
    this._attrs = {};

    /** @public */
    this.__tree = {};

    /** @protected @type {Record<string, unknown>} */
    this._forwarded = {};

    /** @protected */
    this._isMounted = false;

    /** @protected */
    this._isHTMLInjected = false;

    /** @protected */
    this._attributeQueue = [];

    /** @protected */
    this._children = [];

    /**
     * Observes attribute changes and calls `onAttributeChange` and `reactive` if defined in child.
     * @private
     */
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const name = mutation.attributeName;
          const oldValue = mutation.oldValue;
          const newValue = this.getAttribute(name);

          this._attrs[name] = newValue;

          if (typeof this.onAttributeChange === "function") {
            this._attributeQueue.push([newValue, name, oldValue]);
            this._clearAttributesQueue();
          } else {
            if (name !== "style" && name !== "route") {
              this._attributeQueue.push([newValue, name, oldValue]);
            }
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
      /** @public */
      this.__componentId = 0;
    } else {
      assignComponentIdToElement(this);
    }

    /** @public */
    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  _clearAttributesQueue() {
    if (typeof this.onAttributeChange === "function") {
      while (this._attributeQueue.length !== 0) {
        this.onAttributeChange(...this._attributeQueue.shift());

        // Call reactive() if it's implemented in the child component
        if (typeof this.reactive === "function") {
          this.reactive();
        }
      }
    }
  }

  /**
   * Marks the component as mounted and triggers mount on all children.
   * @protected
   */
  _mount() {
    const parent = this.getRootNode().host;
    if (
      this._isHTMLInjected &&
      typeof this.mountCallback === "function" &&
      parent._isMounted
    ) {
      this._isMounted = true;
      this.mountCallback();
      this._updateChildren();
    } else if (this.constructor.name === "AppRoot") {
      this._isMounted = true;
      this._updateChildren();
    }
  }

  _updateChildren() {
    for (const child of this._children) {
      child._mount();
    }
  }

  /**
   * Marks the component as unmounted, cleans up observers and child references.
   * @protected
   */
  _unmount() {
    this.mountCallback = undefined;
    this._isMounted = false;
    this._children = [];
    for (const remove of this._observers.values()) {
      remove?.(this);
    }
    this._observers.clear();
  }

  /**
   * Lifecycle method called automatically when the component is connected to the DOM.
   * Sets up references and registers itself as a child of its parent component if applicable.
   */
  connectedCallback() {
    Piglet.log(`${this._componentName} connected`);
    /** @protected */
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this._caller) this._caller = this.__root.host.__componentKey;
    const parent = this.getRootNode().host;
    if (parent && !parent._children.includes(this)) {
      parent._children.push(this);
    }
    if (this.runScript) {
      // noinspection JSIgnoredPromiseFromCall
      this.runScript();
    }
  }

  /**
   * Registers a callback to be called when this component is mounted.
   * If the parent is already mounted, the callback is called immediately.
   *
   * @param {Function} callback - The function to run when the component is mounted.
   */
  onMount(callback) {
    this.mountCallback = callback;
    this._mount();
  }

  /**
   * Start observing a state property.
   * @param {string} property
   */
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

  /**
   * Initialize a state property with an optional initial value.
   * @param {string} property
   * @param {*=} initialValue
   * @returns {*} The state value
   */
  state(property, initialValue) {
    const state = useState(
      this._caller ?? this.__componentKey,
      property,
      initialValue,
      !!this._caller,
    );
    this.observeState(property);
    return state;
  }

  /**
   * Called when a watched state property changes.
   * Should be implemented by the component if state reactions are needed.
   * Automatically calls `reactive()` if defined in the child component.
   * @param {*} value
   * @param {string} property
   * @param {*} prevValue
   */
  stateChange(value, property, prevValue) {
    if (typeof this.onStateChange === "function") {
      this.onStateChange(value, property, prevValue);

      // Call reactive() if implemented in the child
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

  /**
   * Lifecycle method called when the component is removed from the DOM.
   */
  disconnectedCallback() {
    this._unmount();
  }
}

export default ReactiveComponent;
