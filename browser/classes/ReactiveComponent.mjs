/** @import {BaseReactiveComponentInterface, VirtualReactiveComponentInterface, Member, Virtual} from "@jsdocs/browser/classes/ReactiveComponent.d" */

import { assignComponentIdToElement } from "@Piglet/browser/tree";
import { useState, useObserver } from "@Piglet/browser/hooks";
import { fromPigletAttr, getHost, isShadowRoot } from "@Piglet/browser/helpers";
import { clearAllListenersForHost } from "@Piglet/browser/scriptRunner";
import CONST from "@Piglet/browser/CONST";

/**
 * @implements {BaseReactiveComponentInterface}
 */
class ReactiveComponent extends HTMLElement {
  #pendingAttributeUpdate = false;
  #batchedAttributeChanges = [];

  /**
   * @type {Virtual["attributeChangedCallback"]["Type"]}
   * @returns {Virtual["attributeChangedCallback"]["ReturnType"]}
   * @virtual
   */
  attributeChangedCallback() {}

  /**
   * @type {Virtual["onStateChange"]["Type"]}
   * @returns {Virtual["onStateChange"]["ReturnType"]}
   * @virtual
   */
  onStateChange() {}

  /**
   * @type {Virtual["onAttributeChange"]["Type"]}
   * @returns {Virtual["onAttributeChange"]["ReturnType"]}
   * @virtual
   */
  onAttributeChange() {}

  /**
   * @type {Virtual["reactive"]["Type"]}
   * @returns {Virtual["reactive"]["ReturnType"]}
   * @virtual
   */
  reactive() {}

  /**
   * @type {Virtual["runScript"]["Type"]}
   * @returns {Virtual["runScript"]["ReturnType"]}
   * @virtual
   */
  runScript() {
    return Promise.resolve();
  }

  /**
   * @type {Virtual["onBeforeUpdate"]["Type"]}
   * @returns {Virtual["onBeforeUpdate"]["ReturnType"]}
   * @virtual
   */
  onBeforeUpdate() {}

  /**
   * @type {Virtual["onAfterUpdate"]["Type"]}
   * @returns {Virtual["onAfterUpdate"]["ReturnType"]}
   * @virtual
   */
  onAfterUpdate() {}

  /**
   * @type {Virtual["__trackCustomTree"]["Type"]}
   * @returns {Virtual["__trackCustomTree"]["ReturnType"]}
   * @virtual
   */
  __trackCustomTree() {}

  /** @type {Virtual["__mountData"]["Type"]} */
  __mountData;

  /** @type {Virtual["__customTreeObserver"]["Type"]} */
  __customTreeObserver;

  /** @type {Virtual["_forwarded"]["Type"]} */
  _forwarded = {};

  /** @type {Virtual["_children"]["Type"]} */
  _children = [];

  /** @type {Virtual["_isMounted"]["Type"]} */
  _isMounted = false;

  /** @type {Virtual["_isHTMLInjected"]["Type"]} */
  _isHTMLInjected = false;

  /** @type {Virtual["_mutationObserver"]["Type"]} */
  _mutationObserver = null;

  /** @type {Virtual["_caller"]["Type"]} */
  _caller = null;

  /** @type {Virtual["_componentName"]["Type"]} */
  _componentName = null;

  /** @type {Virtual["__tree"]["Type"]} */
  __tree = {};

  /** @type {Virtual["__componentId"]["Type"]} */
  __componentId;

  /** @type {Virtual["__componentKey"]["Type"]} */
  __componentKey = null;

  /** @type {Virtual["__root"]["Type"]} */
  __root = null;

  /** @type {Virtual["mountCallback"]["Type"]} */
  mountCallback = null;

  /** @type {Virtual["_observers"]["Type"]} */
  _observers;

  /** @type {Virtual["_attrs"]["Type"]} */
  _attrs = {};

  /** @type {Virtual["_stateless"]["Type"]} */
  _stateless;

  constructor() {
    super();

    this._caller = this.getAttribute(CONST.callerAttribute);
    this.removeAttribute(CONST.callerAttribute);
    this._componentName = this.constructor.name;
    this._observers = new Map();

    /**
     * Observes attribute changes and calls `onAttributeChange` and `reactive` if defined in child.
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
                  this.onAttributeChange(newValue, attrName, oldValue);
                }

                this.reactive();
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
      if (attr.name.startsWith(CONST.attributePrefix)) {
        const attrName = fromPigletAttr(attr.name);
        this._attrs[attrName] = attr.value;
      }
    }

    if (this.constructor.name === CONST.appRootName) {
      this.__componentId = 0;
    } else {
      assignComponentIdToElement(this);
    }

    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  /**
   * @type {Member["_mount"]["Type"]}
   * @returns {Member["_mount"]["ReturnType"]}
   */
  _mount(reason) {
    const parent = getHost(this, true);

    if (
      parent &&
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

  /**
   * @type {Member["_updateChildren"]["Type"]}
   * @returns {Member["_updateChildren"]["ReturnType"]}
   */
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
   * @type {Member["reloadComponent"]["Type"]}
   * @returns {Member["reloadComponent"]["ReturnType"]}
   */
  async reloadComponent() {
    this._isHTMLInjected = false;
    this._isMounted = false;
    await this.runScript({ name: "reload" });
    await this.loadContent();
  }

  /**
   * @type {Member["loadContent"]["Type"]}
   * @returns {Member["loadContent"]["ReturnType"]}
   */
  async loadContent() {
    const componentName = this.constructor.name;
    const url = `/component/html/${componentName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Failed to fetch HTML for ${componentName}`);
      }

      this.shadowRoot.innerHTML = await response.text();
      this._isHTMLInjected = true;
      this._mount({ name: "loadContent" });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * @type {Member["_unmount"]["Type"]}
   * @returns {Member["_unmount"]["ReturnType"]}
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
   * @type {Member["connectedCallback"]["Type"]}
   * @returns {Member["connectedCallback"]["ReturnType"]}
   */
  connectedCallback() {
    window.Piglet.log(CONST.pigletLogs.appRoot.componentConnected(this));
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this._caller) {
      const host = getHost(this.__root);
      this._caller = host?.__componentKey;
    }
    const parent = getHost(this, true);
    if (parent && !parent._children.includes(this)) {
      parent._children.push(this);
    }
    this.runScript(CONST.reason.addedToDOM);
  }

  /**
   * @type {Member["onMount"]["Type"]}
   * @returns {Member["onMount"]["ReturnType"]}
   */
  onMount(callback) {
    this.mountCallback = callback;
    this._mount(CONST.reason.onMount);
  }

  /**
   * @type {Member["observeState"]["Type"]}
   * @returns {Member["observeState"]["ReturnType"]}
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
   * @type {Member["state"]["Type"]}
   * @returns {Member["state"]["ReturnType"]}
   */
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
   * @type {Member["stateChange"]["Type"]}
   * @returns {Member["stateChange"]["ReturnType"]}
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
            window.Piglet.log(
              CONST.pigletLogs.appRoot.onStateChangeNotImplemented(
                this,
                property,
              ),
              CONST.coreLogsLevels.warn,
            );
          }
        }
      });
    }
  }

  /**
   * @type {Member["disconnectedCallback"]["Type"]}
   * @returns {Member["disconnectedCallback"]["ReturnType"]}
   */
  disconnectedCallback() {
    this._unmount();
  }

  /**
   * @type {Member["dispatchEvent"]["Type"]}
   * @returns {Member["dispatchEvent"]["ReturnType"]}
   */
  dispatchEvent(event) {
    return false;
  }

  /**
   * @type {Member["adoptedCallback"]["Type"]}
   * @returns {Member["adoptedCallback"]["ReturnType"]}
   */
  adoptedCallback() {}
}

export default ReactiveComponent;
