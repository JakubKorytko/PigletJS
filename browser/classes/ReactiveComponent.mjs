/** @import {BaseReactiveComponentInterface, VirtualReactiveComponentInterface, Member, Virtual} from "@jsdocs/browser/classes/ReactiveComponent.d" */

import { useState, useObserver } from "@Piglet/browser/hooks";
import {
  fromPigletAttr,
  getHost,
  parseHTML,
  sendToExtension,
} from "@Piglet/browser/helpers";
import { clearAllListenersForHost } from "@Piglet/browser/scriptRunner";
import CONST from "@Piglet/browser/CONST";

/**
 * @implements {BaseReactiveComponentInterface}
 */
class ReactiveComponent extends HTMLElement {
  /** @type {boolean} */
  #__pendingAttributeUpdate = false;

  /** @type {Array<{newValue: string, attrName: string, oldValue: string}>} */
  #__batchedAttributeChanges = [];

  /**
   * @type {Virtual["attributeChangedCallback"]["Type"]}
   * @returns {Virtual["attributeChangedCallback"]["ReturnType"]}
   * @virtual
   */
  attributeChangedCallback() {}

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

  /** @type {number} */
  __id;

  /** @type {Virtual["__mountData"]["Type"]} */
  __mountData;

  /** @type {Virtual["_forwarded"]["Type"]} */
  _forwarded = {};

  /** @type {Virtual["__children"]["Type"]} */
  __children = [];

  /** @type {Virtual["__isMounted"]["Type"]} */
  __isMounted = false;

  /** @type {Virtual["__isHTMLInjected"]["Type"]} */
  __isHTMLInjected = false;

  /** @type {Virtual["__mutationObserver"]["Type"]} */
  __mutationObserver = null;

  /** @type {Virtual["__caller"]["Type"]} */
  __caller = "";

  /** @type {Virtual["__componentName"]["Type"]} */
  __componentName = "";

  /** @type {Virtual["__tree"]["Type"]} */
  __tree = {};

  /** @type {Virtual["__componentId"]["Type"]} */
  __componentId;

  /** @type {Virtual["__componentKey"]["Type"]} */
  __componentKey = "";

  /** @type {Virtual["__root"]["Type"]} */
  __root = null;

  /** @type {Virtual["__mountCallback"]["Type"]} */
  __mountCallback = () => {};

  /** @type {Virtual["__observers"]["Type"]} */
  __observers;

  /** @type {Virtual["__attrs"]["Type"]} */
  __attrs = {};

  /** @type {Virtual["__stateless"]["Type"]} */
  __stateless;

  __waitingForScript = [];

  __killed = false;

  __useFragment = false;

  get __isKilled() {
    const parent = getHost(this, true);
    const grandParent = getHost(parent ?? this, true);

    return this.__killed || parent?.__killed || grandParent?.__killed;
  }

  kill() {
    this.__killed = true;
    this.remove();
  }

  disableHMR() {
    this.__preventReload = true;
  }

  constructor() {
    super();

    if (this.__isKilled) return;

    this.__caller = this.getAttribute(CONST.callerAttribute);
    this.removeAttribute(CONST.callerAttribute);
    this.__componentName = this.constructor.name;
    this.__observers = new Map();

    /**
     * Observes attribute changes.
     */
    this.__mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const name = mutation.attributeName;
          const oldValue = mutation.oldValue;
          const newValue = this.getAttribute(name);

          if (name.startsWith(CONST.attributePrefix)) {
            const attrName = fromPigletAttr(name);

            this.#__batchedAttributeChanges.push({
              newValue,
              attrName,
              oldValue,
            });

            this.__attrs[attrName] = newValue;

            if (!this.#__pendingAttributeUpdate) {
              this.#__pendingAttributeUpdate = true;

              Promise.resolve().then(() => {
                this.#__pendingAttributeUpdate = false;

                const changes = this.#__batchedAttributeChanges;
                this.#__batchedAttributeChanges = [];

                this._mount(CONST.reason.attributesChange(changes));
              });
            }
          }
        }
      }
    });

    this.__mutationObserver.observe(this, {
      attributes: true,
      attributeOldValue: true,
    });

    for (const attr of this.attributes) {
      if (attr.name.startsWith(CONST.attributePrefix)) {
        const attrName = fromPigletAttr(attr.name);
        this.__attrs[attrName] = attr.value;
      }
    }

    if (this.constructor.name === CONST.appRootName) {
      this.__componentId = 0;
    } else if (this.__componentId === undefined) {
      this.__componentId = ++window.Piglet.componentCounter;
    }

    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  /**
   * @type {Member["_mount"]["Type"]}
   * @returns {Member["_mount"]["ReturnType"]}
   */
  _mount(reason) {
    const parent = getHost(this, true);

    if (parent && parent.__isMounted && this.__isHTMLInjected) {
      this.__isMounted = true;
      this.__mountCallback(reason);
      this._updateChildren(reason);
    } else if (this.constructor.name === "AppRoot") {
      this.__isMounted = true;
      this._updateChildren(reason);
    }
  }

  /**
   * @type {Member["_updateChildren"]["Type"]}
   * @returns {Member["_updateChildren"]["ReturnType"]}
   */
  _updateChildren(reason) {
    for (const child of this.__children) {
      if (!child.__isMounted || child.__stateless) {
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
    if (this.__isKilled || this.__preventReload) {
      return;
    }
    this.__isHTMLInjected = false;
    this.__isMounted = false;
    await this.runScript({ name: "reload" });
    await this.loadContent(false);
  }

  /**
   * @type {Member["loadContent"]["Type"]}
   * @returns {Member["loadContent"]["ReturnType"]}
   */
  async loadContent(canUseMemoized) {
    const componentName = this.constructor.name;
    const url = `/component/html/${componentName}`;

    try {
      let html;

      if (canUseMemoized) {
        html = await window.fetchWithCache(url);
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          throw CONST.error.failedToFetchHTML(componentName);
        }
        html = await response.text();
      }

      this.shadowRoot.innerHTML = html;
      this.__isHTMLInjected = true;
      this._mount({ name: "loadContent" });
    } catch (error) {
      window.Piglet.log(CONST.pigletLogs.appRoot.errorLoading(componentName));
      return null;
    }
  }

  /**
   * @type {Member["_unmount"]["Type"]}
   * @returns {Member["_unmount"]["ReturnType"]}
   */
  _unmount() {
    this.__mountCallback = undefined;
    this.__isMounted = false;
    this.__children = [];
    for (const remove of this.__observers.values()) {
      remove?.(this);
    }
    this.__observers.clear();
  }

  /**
   * @type {Member["connectedCallback"]["Type"]}
   * @returns {Member["connectedCallback"]["ReturnType"]}
   */
  connectedCallback() {
    this.__mountData = {
      key: this.__componentKey,
      tag: this.tagName,
      ref: this,
    };

    window.Piglet.mountedComponents.add(this.__mountData);

    if (this.__isKilled) {
      this.remove();
      return;
    }
    window.Piglet.log(CONST.pigletLogs.appRoot.componentConnected(this));
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this.__caller) {
      const host = getHost(this.__root);
      this.__caller = host?.__componentKey;
    }
    const parent = getHost(this, true);
    if (parent && !parent.__children.includes(this)) {
      parent.__children.push(this);
    }
    this.runScript(CONST.reason.addedToDOM).then(() => {
      this.__ranScript = true;
      if (this.__waitingForScript.length > 0) {
        for (const child of this.__waitingForScript) {
          child.loadContent(true);
        }
        this.__waitingForScript = [];
      }
    });
    sendToExtension(CONST.extension.tree);
  }

  /**
   * @type {Member["onMount"]["Type"]}
   * @returns {Member["onMount"]["ReturnType"]}
   */
  onMount(callback) {
    this.__mountCallback = callback;
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
      this.__caller ?? this.__componentKey,
      property,
    );

    if (this.__observers.has(property)) {
      const oldRemove = this.__observers.get(property);
      oldRemove?.(this);
    }

    addObserver(callback);
    this.__observers.set(property, () => removeObserver(callback));
  }

  /**
   * @type {Member["state"]["Type"]}
   * @returns {Member["state"]["ReturnType"]}
   */
  state(property, initialValue, asRef = false) {
    const state = useState(
      this.__caller ?? this.__componentKey,
      property,
      initialValue,
      !!this.__caller,
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
      });
    }
  }

  /**
   * @type {Member["disconnectedCallback"]["Type"]}
   * @returns {Member["disconnectedCallback"]["ReturnType"]}
   */
  disconnectedCallback() {
    if (window.Piglet.componentsCount?.[this.__componentName] > 0) {
      window.Piglet.componentsCount[this.__componentName]--;
    }
    window.Piglet.mountedComponents.delete(this.__mountData);
    sendToExtension(CONST.extension.tree);
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
