/** @import {RenderIfInterface, Virtual, Member} from "@jsdocs/browser/classes/RenderIf.d" */

import { getDeepValue } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";
import State from "@Piglet/browser/classes/State";

/** @implements {RenderIfInterface} */
class RenderIf extends ReactiveDummyComponent {
  // noinspection JSUnusedGlobalSymbols
  static get observedAttributes() {
    return [CONST.conditionAttribute];
  }

  /** @type {RenderIfMembers["_condition"]["Type"]} */
  _condition;

  /** @type {RenderIfMembers["_negated"]["Type"]} */
  _negated = false;

  /** @type {RenderIfMembers["_parts"]["Type"]} */
  _parts = [];

  /** @type {RenderIfMembers["_contentFragment"]["Type"]} */
  _contentFragment = document.createDocumentFragment();

  /** @type {RenderIfMembers["_contentMounted"]["Type"]} */
  _contentMounted = true;

  /** @type {RenderIfVirtualMembers["shouldBatchRefUpdates"]["Type"]} */
  shouldBatchRefUpdates = false;

  /**
   * @type {RenderIfMembers["_moveChildrenToFragment"]["Type"]}
   * @returns {RenderIfMembers["_moveChildrenToFragment"]["ReturnType"]}
   */
  _moveChildrenToFragment() {
    this._contentFragment.append(...this.childNodes);
  }

  /**
   * @type {RenderIfVirtualMembers["attributeChangedCallback"]["Type"]}
   * @returns {RenderIfVirtualMembers["attributeChangedCallback"]["ReturnType"]}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name === CONST.conditionAttribute &&
      oldValue !== newValue &&
      this._parent
    ) {
      this._updateFromAttribute();
    }
  }

  /**
   * @type {RenderIfMembers["_updateFromAttribute"]["Type"]}
   * @returns {RenderIfMembers["_updateFromAttribute"]["ReturnType"]}
   */
  _updateFromAttribute() {
    let conditionProperty = this.attrs.condition;
    if (typeof conditionProperty !== "string") {
      if (conditionProperty instanceof State) {
        this._state = conditionProperty;
        super.observeState(conditionProperty);
        this._updateCondition(this._state);
        return;
      }

      this._updateCondition(conditionProperty);
      return;
    }

    this._negated = false;
    if (conditionProperty.startsWith("!")) {
      this._negated = true;
      conditionProperty = conditionProperty.substring(1);
    }

    if (
      /^true$/i.test(conditionProperty) ||
      /^false$/i.test(conditionProperty)
    ) {
      this._condition = /^true$/i.test(conditionProperty);
      this.updateVisibility();
      return;
    }

    let state = this.root.globalState[this._parent.__componentKey];
    let isUsingHerd = false;

    if (conditionProperty.startsWith("H$")) {
      // Handle Herd state
      state = this.root.herd.globalState;
      conditionProperty = conditionProperty.substring(2);
      isUsingHerd = true;
    } else if (!conditionProperty.startsWith("$")) {
      this._condition = true;
      this.updateVisibility();
      return;
    } else {
      conditionProperty = conditionProperty.substring(1);
    }

    const parts = conditionProperty.split(".");
    const isAttribute = parts[0] === CONST.attributesObjectName;

    if (isAttribute) {
      conditionProperty = conditionProperty.replace(`${parts.shift()}.`, "");
    }

    if (parts.length > 1) {
      if (!isAttribute) {
        this._parts = parts.slice(1);
      }
      conditionProperty = parts[0];
    } else {
      this._parts = [];
    }

    if (isAttribute) {
      // TODO: Handle attributes passed in HTML tag correctly
      this._updateCondition(
        this._parent.attrs[conditionProperty] ??
          this._parent.attrs[conditionProperty.toLowerCase()],
      );
    } else {
      if (!state?.[conditionProperty]) {
        console.pig(
          CONST.pigletLogs.conditionNotFoundInState(conditionProperty),
          CONST.coreLogsLevels.warn,
        );
        this._condition = this._negated;
        this.updateVisibility();
        return;
      }
      const { _state } = state[conditionProperty];
      this._state =
        _state === CONST.symbols.setViaGetterMarker ? undefined : _state;

      if (isUsingHerd) {
        this.root.herd.observe(this, conditionProperty);
      } else {
        super.observeState(conditionProperty);
      }
      this._updateCondition(this._state);
    }
  }

  /**
   * @type {RenderIfMembers["_updateCondition"]["Type"]}
   * @returns {RenderIfMembers["_updateCondition"]["ReturnType"]}
   */
  _updateCondition(value) {
    const innerValue = getDeepValue(value, this._parts);
    this._condition = Boolean(innerValue);

    if (this._negated) {
      this._condition = !this._condition;
    }

    this.updateVisibility();
  }

  /**
   * @type {RenderIfMembers["updateVisibility"]["Type"]}
   * @returns {RenderIfMembers["updateVisibility"]["ReturnType"]}
   */
  updateVisibility() {
    if (this._condition && !this._contentMounted) {
      this.append(this._contentFragment);
      this.style.removeProperty("display");
      this._contentMounted = true;
    } else if (!this._condition && this._contentMounted) {
      this._moveChildrenToFragment();
      this.style.setProperty("display", "none");
      this._contentMounted = false;
    }
  }

  /**
   * @type {RenderIfVirtualMembers["_mount"]["Type"]}
   * @returns {RenderIfVirtualMembers["_mount"]["ReturnType"]}
   */
  _mount(reason) {
    this._updateFromAttribute();
    return Promise.all([true]);
  }

  /**
   * @type {RenderIfVirtualMembers["_update"]["Type"]}
   * @returns {RenderIfVirtualMembers["_update"]["ReturnType"]}
   */
  _update(value) {
    this._updateCondition(value);
  }

  /**
   * @type {RenderIfVirtualMembers["_refUpdate"]["Type"]}
   * @returns {RenderIfVirtualMembers["_refUpdate"]["ReturnType"]}
   */
  _refUpdate(value) {
    this._updateCondition(value);
  }
}

export default RenderIf;
