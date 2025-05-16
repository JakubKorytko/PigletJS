/** @import {BaseReactiveComponentInterface, VirtualReactiveComponentInterface, Member, Virtual} from "@jsdocs/browser/classes/ReactiveComponent.d" */

import { useState, useObserver } from "@Piglet/browser/hooks";
import {
  getHost,
  parseHTML,
  sendToExtension,
  contextParent,
  directParent,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import { clearAllListenersForHost } from "@Piglet/browser/scriptRunner";

/**
 * @implements {BaseReactiveComponentInterface}
 */
class ReactiveComponent extends HTMLElement {
  /**
   * @type {Virtual["runScript"]["Type"]}
   * @returns {Virtual["runScript"]["ReturnType"]}
   * @virtual
   */
  async runScript(reason) {}

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

  /** @type {Virtual["__componentName"]["Type"]} */
  __componentName = "";

  /** @type {Virtual["__componentId"]["Type"]} */
  __componentId;

  /** @type {Virtual["__componentKey"]["Type"]} */
  __componentKey = "";

  /** @type {Virtual["__mountCallback"]["Type"]} */
  __mountCallback = (reason) => {};

  /** @type {Member["__mountData"]["Type"]} */
  __mountData;

  /** @type {Member["__observers"]["Type"]} */
  __observers;

  /** @type {Member["attrs"]["Type"]} */
  attrs = {};

  /** @type {Member["forwardedQueue"]["Type"]} */
  forwardedQueue = [];

  /** @type {Member["internal"]["Type"]} */
  internal = {
    owner: undefined,
    HMR: true,
    mounted: false,
    children: [],
    waiters: [],
    fragment: {
      content: undefined,
      enabled: false,
      fragmentRoot: undefined,
    },
    get parent() {
      return getHost(this.owner, true);
    },
  };

  #pendingStateUpdate = false;
  #batchedChanges = [];

  /**
   * @type {Member["disableHMR"]["Type"]}
   * @returns {Member["disableHMR"]["ReturnType"]}
   */
  disableHMR() {
    this.internal.HMR = false;
  }

  /**
   * @type {Member["injectFragment"]["Type"]}
   * @returns {Member["injectFragment"]["ReturnType"]}
   */
  injectFragment() {
    if (!this.internal.fragment.content || !this.internal.fragment.enabled)
      return;

    this.internal.fragment.enabled = false;
    this.shadowRoot.appendChild(this.internal.fragment.content);
    this.__mountCallback(CONST.reason.fragmentInjected);
  }

  initialSetup() {
    this.internal.owner = this;
    this.internal.fragment.enabled =
      this.attributes.getNamedItem("fragment") !== null;
    this.internal.fragment.fragmentRoot = contextParent(this.getRootNode());
    this.__componentName = this.constructor.name;
    this.__observers = new Map();
    this.__componentId = window.Piglet.componentCounter++;
    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
    this.__mountData = {
      key: this.__componentKey,
      tag: this.tagName,
      ref: this,
    };
    directParent(this.getRootNode())?.internal.children.push(this);
    window.Piglet.constructedComponents[this.__componentKey] = this;
  }

  constructor() {
    super();

    this.initialSetup();

    const { fragmentRoot } = this.internal.fragment;
    const fragmentEnabled = fragmentRoot?.internal.fragment.enabled;

    if (fragmentRoot && !fragmentEnabled) {
      return undefined;
    }

    this.attachShadow({ mode: "open" });
  }

  /**
   * @type {Member["_mount"]["Type"]}
   * @returns {Member["_mount"]["ReturnType"]}
   */
  async _mount(reason) {
    await this.runScript(reason);
    const shouldContinue = await this.loadContent(CONST.reasonCache(reason));
    if (!shouldContinue) {
      return;
    }
    sendToExtension(CONST.extension.tree);
    this.__mountCallback(reason);
    this.internal.mounted = true;
    window.Piglet.mountedComponents.add(this.__mountData);
    window.Piglet.log(CONST.pigletLogs.appRoot.componentConnected(this));
    while (this.internal.waiters.length > 0) {
      this.internal.waiters.shift()._mount(CONST.reason.parentUpdate);
    }
  }

  /**
   * @type {Member["loadContent"]["Type"]}
   * @returns {Member["loadContent"]["ReturnType"]}
   */
  async loadContent(canUseMemoized) {
    const { fragmentRoot } = this.internal.fragment;

    const isFragmentRoot = this.internal.fragment.enabled;
    const isFragmentElement = !!fragmentRoot;
    const isFragmentRootEnabled = fragmentRoot?.internal.fragment.enabled;

    if (!isFragmentRoot && isFragmentElement && !isFragmentRootEnabled) {
      return false;
    }

    const componentName = this.__componentName;
    const url = `${CONST.componentRoute.html}/${componentName}`;

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

    const fragment = parseHTML(html, this);

    if (this.internal.fragment.enabled) {
      this.internal.fragment.content = fragment;
    } else {
      this.shadowRoot.replaceChildren();
      this.shadowRoot.appendChild(fragment);
    }

    if (isFragmentElement || isFragmentRoot) {
      for (const child of this.internal.children) {
        child.connectedCallback();
      }
    }

    return true;
  }

  /**
   * @type {Member["unmount"]["Type"]}
   * @returns {Member["unmount"]["ReturnType"]}
   */
  unmount() {
    window.Piglet.mountedComponents.delete(this.__mountData);
    this.__mountCallback = undefined;
    this.internal.mounted = false;
    for (const remove of this.__observers.values()) {
      remove?.(this);
    }
    this.__observers.clear();
    this.shadowRoot?.replaceChildren();
    sendToExtension(CONST.extension.tree);
  }

  /**
   * @type {Member["connectedCallback"]["Type"]}
   * @returns {Member["connectedCallback"]["ReturnType"]}
   */
  connectedCallback() {
    const parent = this.internal.parent.internal;

    if (parent.mounted) {
      this._mount(CONST.reason.onMount);
    } else {
      parent.waiters.push(this);
    }
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
      this.__componentKey,
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
      this.__componentKey,
      property,
      initialValue,
      false,
      asRef,
    );
    this.observeState(property);
    return state;
  }

  clearListeners() {
    clearAllListenersForHost(this);
  }

  /**
   * @type {Member["stateChange"]["Type"]}
   * @returns {Member["stateChange"]["ReturnType"]}
   */
  stateChange(value, property, prevValue) {
    this.#batchedChanges.push({ value, property, prevValue });

    if (!this.#pendingStateUpdate) {
      this.#pendingStateUpdate = true;
      Promise.resolve().then(() => {
        const changes = this.#batchedChanges;
        this.#batchedChanges = [];
        this.#pendingStateUpdate = false;

        this.__mountCallback(CONST.reason.stateChange(changes));
      });
    }
  }

  /**
   * @type {Member["disconnectedCallback"]["Type"]}
   * @returns {Member["disconnectedCallback"]["ReturnType"]}
   */
  disconnectedCallback() {
    this.unmount();
  }

  dispatchEvent(event) {
    return false;
  }
}

export default ReactiveComponent;
