/** @import {BaseReactiveComponentInterface, VirtualReactiveComponentInterface, ReactiveMembers, ReactiveVirtualMembers} from "@jsdocs/browser/classes/ReactiveComponent.d" */

import { useState, useObserver } from "@Piglet/browser/hooks";
import {
  parseHTML,
  sendToExtension,
  fetchComponentData,
  extractComponentTagsFromString,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import scriptRunner, {
  clearAllListenersForHost,
} from "@Piglet/browser/scriptRunner";

/**
 * @implements {BaseReactiveComponentInterface}
 */
class ReactiveComponent extends HTMLElement {
  #pendingStateUpdate = false;

  /**
   * @template T
   * @type {{value: T, property: string, prevValue: T}[]}
   */
  #batchedChanges = [];

  /**
   * @type {ReactiveVirtualMembers["onBeforeUpdate"]["Type"]}
   * @returns {ReactiveVirtualMembers["onBeforeUpdate"]["ReturnType"]}
   */
  onBeforeUpdate() {}

  /**
   * @type {ReactiveVirtualMembers["onAfterUpdate"]["Type"]}
   * @returns {ReactiveVirtualMembers["onAfterUpdate"]["ReturnType"]}
   */
  onAfterUpdate() {}

  /**
   * @type {ReactiveVirtualMembers["__mountCallback"]["Type"]}
   * @returns {ReactiveVirtualMembers["__mountCallback"]["ReturnType"]}
   * @virtual
   */
  __mountCallback = (reason) => {};

  /** @type {ReactiveVirtualMembers["__componentName"]["Type"]} */
  __componentName = "";

  /** @type {ReactiveVirtualMembers["__componentId"]["Type"]} */
  __componentId;

  /** @type {ReactiveVirtualMembers["__componentKey"]["Type"]} */
  __componentKey = "";

  /** @type {ReactiveMembers["__mountData"]["Type"]} */
  __mountData;

  /** @type {ReactiveMembers["__observers"]["Type"]} */
  __observers;

  /** @type {ReactiveMembers["attrs"]["Type"]} */
  attrs = {};

  /** @type {ReactiveMembers["forwardedQueue"]["Type"]} */
  forwardedQueue = [];

  /** @type {ReactiveMembers["_storedChildren"]["Type"]} */
  _storedChildren = document.createDocumentFragment();

  /** @type {ReactiveMembers["childrenInjected"]["Type"]} */
  childrenInjected = false;

  /** @type {ReactiveMembers["states"]["Type"]} */
  states = {};

  /** @type {ReactiveMembers["internal"]["Type"]} */
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
      return this.owner._parent;
    },
  };

  /**
   * @type {ReactiveMembers["initialSetup"]["Type"]}
   * @returns {ReactiveMembers["initialSetup"]["ReturnType"]}
   */
  initialSetup(attrs) {
    this.attrs = attrs ?? {};
    this.internal.owner = this;
    this._parent = this.attrs.parent ?? undefined;
    this.internal.fragment.enabled = this.attrs.fragment ?? false;
    this.internal.fragment.fragmentRoot = this.attrs.fragmentRoot ?? undefined;
    this.__observers = new Map();
    this.__componentId = window.Piglet.componentCounter++;
    this.__componentName = this.constructor.name;
    this.__componentKey = `${this.__componentName}${this.__componentId}`;
    this.__mountData = {
      key: this.__componentKey,
      tag: this.tagName,
      ref: this,
    };
    this._parent?.internal.children.push(this);
    window.Piglet.constructedComponents[this.__componentKey] = this;
  }

  constructor(attrs) {
    super();

    this.initialSetup(attrs);

    const { fragmentRoot } = this.internal.fragment;
    const fragmentEnabled = fragmentRoot?.internal.fragment.enabled;

    if (fragmentRoot && !fragmentEnabled) {
      return undefined;
    }

    this.attachShadow({ mode: "open" });
  }

  /**
   * @type {ReactiveMembers["connectedCallback"]["Type"]}
   * @returns {ReactiveMembers["connectedCallback"]["ReturnType"]}
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
   * @type {ReactiveMembers["disconnectedCallback"]["Type"]}
   * @returns {ReactiveMembers["disconnectedCallback"]["ReturnType"]}
   */
  disconnectedCallback() {
    this.unmount();
  }

  /**
   * @type {ReactiveMembers["_mount"]["Type"]}
   * @returns {ReactiveMembers["_mount"]["ReturnType"]}
   */
  async _mount(reason) {
    await this.runScript(reason);
    const shouldContinue = await this.loadContent(CONST.reasonCache(reason));
    if (!shouldContinue) return Promise.resolve(false);
    sendToExtension(CONST.extension.tree);
    this.__mountCallback(reason);
    this.internal.mounted = true;
    window.Piglet.mountedComponents.add(this.__mountData);
    window.Piglet.log(CONST.pigletLogs.appRoot.componentConnected(this));
    /** @type {Promise<Awaited<boolean>[]>|[]} */
    const promises = [];
    while (this.internal.waiters.length > 0) {
      promises.push(
        this.internal.waiters.shift()._mount(CONST.reason.parentUpdate),
      );
    }
    return Promise.all(promises);
  }

  /**
   * @type {ReactiveMembers["unmount"]["Type"]}
   * @returns {ReactiveMembers["unmount"]["ReturnType"]}
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
   * @type {ReactiveMembers["disableHMR"]["Type"]}
   * @returns {ReactiveMembers["disableHMR"]["ReturnType"]}
   */
  disableHMR() {
    this.internal.HMR = false;
  }

  /**
   * @type {ReactiveMembers["injectFragment"]["Type"]}
   * @returns {ReactiveMembers["injectFragment"]["ReturnType"]}
   */
  injectFragment() {
    if (!this.internal.fragment.content || !this.internal.fragment.enabled)
      return;

    this.internal.fragment.enabled = false;
    this.shadowRoot.appendChild(this.internal.fragment.content);
    this.__mountCallback(CONST.reason.fragmentInjected);
  }

  /**
   * @type {ReactiveMembers["appendChildren"]["Type"]}
   * @returns {ReactiveMembers["appendChildren"]["ReturnType"]}
   */
  appendChildren(fragment) {
    const kinderGarten = fragment.querySelector("kinder-garten");

    if (!kinderGarten) {
      return;
    }

    if (!this.childrenInjected) {
      kinderGarten.append(...this.childNodes);
      this.childrenInjected = true;
      return;
    }

    kinderGarten.append(this._storedChildren);
  }

  /**
   * @type {ReactiveMembers["loadContent"]["Type"]}
   * @returns {ReactiveMembers["loadContent"]["ReturnType"]}
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
      window.Piglet.__fetchCache.set(url, html);
    }

    const fragment = parseHTML(html, this);
    this.appendChildren(fragment);

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
   * @type {ReactiveMembers["observeState"]["Type"]}
   * @returns {ReactiveMembers["observeState"]["ReturnType"]}
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
   * @type {ReactiveMembers["state"]["Type"]}
   * @returns {ReactiveMembers["state"]["ReturnType"]}
   */
  state(property, initialValue, asRef = false) {
    const state = useState(this.__componentKey, property, initialValue, asRef);
    this.observeState(property);
    return state;
  }

  clearListeners() {
    clearAllListenersForHost(this);
  }

  /**
   * @type {ReactiveMembers["stateChange"]["Type"]}
   * @returns {ReactiveMembers["stateChange"]["ReturnType"]}
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

  dispatchEvent(event) {
    return false;
  }

  /**
   * @type {ReactiveMembers["runScript"]["Type"]}
   * @returns {ReactiveMembers["runScript"]["ReturnType"]}
   */
  async runScript(reason) {
    try {
      const { script } = await fetchComponentData(
        this.__componentName,
        [CONST.componentRoute.script],
        CONST.reasonCache(reason),
      );
      if (!script) {
        return;
      }
      const tags = extractComponentTagsFromString(script.toString());
      await window.Piglet.AppRoot?.loadCustomComponents(tags);
      scriptRunner(this, script, reason);
    } catch (error) {
      window.Piglet.log(
        CONST.pigletLogs.errorLoadingScript,
        CONST.coreLogsLevels.warn,
        error,
      );
    }
  }
}

export default ReactiveComponent;
