import { assignComponentIdToElement } from "@Piglet/browser/tree";
import { useState, useObserver } from "@Piglet/browser/state";
import { fromPigletAttr } from "@Piglet/browser/helpers";
import { clearAllListenersForHost } from "@Piglet/browser/scriptRunner";
import CONST from "@Piglet/browser/CONST";

/**
 * @typedef State
 * @param {string} property
 * @param {*=} initialValue
 * @returns {{value: *}} The state value
 */

/**
 * @typedef GetRootNode
 * @param {GetRootNodeOptions=} options
 * @returns Node
 */

/**
 * Base class for custom elements with reactive state and attribute tracking.
 * Child components can optionally implement `onStateChange`, `onAttributeChange`, and `reactive`.
 * @property {string} _caller The host element associated with this component.
 * @property {string} _componentName The name of the component.
 * @property {Map} _observers A map of observers for the component's state.
 * @property {Record<string, string>} _attrs A record of the component's attributes.
 * @property {Object} __tree The tree structure of the component.
 * @property {Record<string, unknown>} _forwarded The forwarded properties.
 * @property {boolean} _isMounted Indicates if the component is mounted.
 * @property {boolean} _isHTMLInjected Indicates if the component's HTML has been injected.
 * @property {Array} _attributeQueue The queue of attribute changes.
 * @property {Array} _children The children of the component.
 * @property {number} __componentId The unique component ID.
 * @property {string} __componentKey The unique component key.
 * @property {ShadowRoot} shadowRoot
 * @property {State} state
 * @property {GetRootNode} getRootNode
 * @property {Function} _clearAttributesQueue
 * @property {Function} onMount
 * @property {Function} reloadComponent
 */
class ReactiveComponent extends HTMLElement {
  #pendingAttributeUpdate = false;
  #batchedAttributeChanges = [];

  constructor() {
    super();

    /** @public */
    this._caller = this.getAttribute(CONST.callerAttribute);
    this.removeAttribute(CONST.callerAttribute);

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

    this._attributeFlushScheduled = false;

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

          if (name.startsWith(CONST.attributePrefix)) {
            const attrName = fromPigletAttr(name);

            this.#batchedAttributeChanges.push({
              newValue,
              attrName,
              oldValue,
            });

            this._attrs[attrName] = newValue;

            if (!this.#pendingAttributeUpdate) {
              this.#pendingAttributeUpdate = true;

              Promise.resolve().then(() => {
                this.#pendingAttributeUpdate = false;

                const changes = this.#batchedAttributeChanges;
                this.#batchedAttributeChanges = [];

                this._mount(CONST.reason.attributesChange(changes));

                for (const { newValue, attrName, oldValue } of changes) {
                  if (typeof this.onAttributeChange === "function") {
                    this.onAttributeChange(newValue, attrName, oldValue);
                  }
                }

                if (typeof this.reactive === "function") {
                  this.reactive();
                }
              });
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
      if (name.startsWith(CONST.attributePrefix)) {
        const attrName = fromPigletAttr(name);

        this._attrs[attrName] = attr.value;
      }
    }

    if (this.constructor.name === CONST.appRootName) {
      /** @public */
      this.__componentId = 0;
    } else {
      assignComponentIdToElement(this);
    }

    /** @public */
    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  /**
   * Marks the component as mounted and triggers mount on all children.
   * @protected
   */
  _mount(reason) {
    const parent = this.getRootNode().host;
    if (
      this._isHTMLInjected &&
      typeof this.mountCallback === "function" &&
      parent._isMounted
    ) {
      this._isMounted = true;
      this.mountCallback(reason);
      this._updateChildren(reason);
    } else if (this.constructor.name === "AppRoot") {
      this._isMounted = true;
      this._updateChildren(reason);
    }
  }

  _updateChildren(reason) {
    for (const child of this._children) {
      if (!child._isMounted || child._stateless) {
        child._mount(CONST.reason.parentUpdate(reason));
      } else {
        child._updateChildren(reason);
      }
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
    Piglet.log(CONST.pigletLogs.appRoot.componentConnected(this));
    /** @protected */
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this._caller) this._caller = this.__root.host.__componentKey;
    const parent = this.getRootNode().host;
    if (parent && !parent._children.includes(this)) {
      parent._children.push(this);
    }

    if (this.runScript) {
      // noinspection JSIgnoredPromiseFromCall
      this.runScript(CONST.reason.addedToDOM);
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
    this._mount(CONST.reason.onMount);
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

  state(property, initialValue, asRef = false) {
    const state = useState(
      this._caller ?? this.__componentKey,
      property,
      initialValue,
      !!this._caller,
      asRef,
    );
    this.observeState(property);
    return state;
  }

  #pendingStateUpdate = false;
  #batchedChanges = [];

  /**
   * Called when a watched state property changes.
   * Should be implemented by the component if state reactions are needed.
   * Automatically calls `reactive()` if defined in the child component.
   * @param {*} value
   * @param {string} property
   * @param {*} prevValue
   */
  stateChange(value, property, prevValue) {
    clearAllListenersForHost(this);

    this.#batchedChanges.push({ value, property, prevValue });

    if (!this.#pendingStateUpdate) {
      this.#pendingStateUpdate = true;
      Promise.resolve().then(() => {
        const changes = this.#batchedChanges;
        this.#batchedChanges = [];
        this.#pendingStateUpdate = false;

        this._mount(CONST.reason.stateChange(changes));

        if (typeof this.onStateChange === "function") {
          for (const { value, property, prevValue } of changes) {
            this.onStateChange(value, property, prevValue);
          }
          if (typeof this.reactive === "function") {
            this.reactive();
          }
        } else {
          for (const { property } of changes) {
            Piglet.log(
              CONST.pigletLogs.onStateChangeNotImplemented(this, property),
              CONST.coreLogsLevels.warn,
            );
          }
        }
      });
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
