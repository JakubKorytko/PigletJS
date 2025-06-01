/** @import {BaseReactiveDummyComponentInterface, ReactiveDummyVirtualMembers, ReactiveDummyMembers} from "@Piglet/browser/classes/ReactiveDummyComponent.d" */

import { useObserver } from "@Piglet/browser/hooks";

/** @implements {BaseReactiveDummyComponentInterface} */
class ReactiveDummyComponent extends HTMLElement {
  /** @type {ReactiveDummyMembers["__observers"]["Type"]} */
  __observers = new Map();

  /** @type {ReactiveDummyMembers["shouldBatchRefUpdates"]["Type"]} */
  shouldBatchRefUpdates = true;

  #pendingStateUpdate = false;

  #pendingRefUpdate = false;

  /**
   * @type {ReactiveDummyVirtualMembers["_mount"]["Type"]}
   * @returns {ReactiveDummyVirtualMembers["_mount"]["ReturnType"]}
   */
  _mount() {}

  constructor(attrs, root) {
    super();

    this.root = root ?? this.root;
    this.__componentId = `${crypto.getRandomValues(new Uint8Array(1))}${Date.now()}`;
    this.__componentKey = `dummy-${this.__componentId}`;
    this.attrs = attrs ?? {};
    this._parent = this.attrs.parent ?? undefined;
    this.classList.add(this.__componentKey);
    this.createStyleTag(
      `@layer {.${this.__componentKey} {display: contents;}}`,
    );
  }

  /**
   * @type {ReactiveDummyMembers["createStyleTag"]["Type"]}
   * @returns {ReactiveDummyMembers["createStyleTag"]["ReturnType"]}
   */
  createStyleTag(textContent) {
    const style = document.createElement("style");
    style.setAttribute("data-piglet-persistent", "");
    style.textContent = textContent;
    this.append(style);
  }

  /**
   * @type {ReactiveDummyMembers["connectedCallback"]["Type"]}
   * @returns {ReactiveDummyMembers["connectedCallback"]["ReturnType"]}
   */
  connectedCallback() {
    const parent = this._parent?.internal;

    if (parent?.mounted) {
      this._mount();
    } else {
      parent?.waiters.push(this);
    }
  }

  /**
   * @type {ReactiveDummyMembers['observeState']['Type']}
   * @returns {ReactiveDummyMembers['observeState']['ReturnType']}
   */
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
      this.root,
    );

    if (this.__observers.has(property)) {
      const oldRemove = this.__observers.get(property);
      oldRemove?.(this);
    }

    addObserver(callback);
    this.__observers.set(property, () => removeObserver(callback));
  }

  /**
   * @type {ReactiveDummyMembers["stateChange"]["Type"]}
   * @returns {ReactiveDummyMembers["stateChange"]["ReturnType"]}
   */
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

  /**
   * @type {ReactiveDummyMembers["passRefUpdate"]["Type"]}
   * @returns {ReactiveDummyMembers["passRefUpdate"]["ReturnType"]}
   */
  passRefUpdate(value, property, prevValue) {
    if (prevValue !== value || (typeof value === "object" && value !== null)) {
      this._refUpdate(value, property, prevValue);
    }
  }

  /**
   * @type {ReactiveDummyMembers["refChange"]["Type"]}
   * @returns {ReactiveDummyMembers["refChange"]["ReturnType"]}
   */
  refChange(value, property, prevValue) {
    if (!this.#pendingRefUpdate && this.shouldBatchRefUpdates) {
      this.#pendingRefUpdate = true;
      Promise.resolve().then(() => {
        this.#pendingRefUpdate = false;
        this.passRefUpdate(value, property, prevValue);
      });
    }
    if (!this.shouldBatchRefUpdates) {
      this.passRefUpdate(value, property, prevValue);
    }
  }

  dispatchEvent(event) {
    return false;
  }
}

export default ReactiveDummyComponent;
