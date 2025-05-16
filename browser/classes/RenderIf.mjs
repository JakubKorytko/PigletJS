/** @import {RenderIfInterface, Virtual, Member} from "@jsdocs/browser/classes/RenderIf.d" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
/** @typedef {InterfaceMethodTypes<RenderIfInterface>} RenderIfMethods */
import { getDeepValue } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";
import ReactiveDummyComponent from "@Piglet/browser/classes/ReactiveDummyComponent";

/** @implements {RenderIfInterface} */
class RenderIf extends ReactiveDummyComponent {
  // noinspection JSUnusedGlobalSymbols
  static get observedAttributes() {
    return [CONST.conditionAttribute];
  }

  _condition;
  _negated = false;
  _parts = [];
  _contentFragment = document.createDocumentFragment();
  _contentMounted = true;

  /**
   * @type {Member["_moveChildrenToFragment"]["Type"]}
   * @returns {Member["_moveChildrenToFragment"]["ReturnType"]}
   */
  _moveChildrenToFragment() {
    while (this.firstChild) {
      this._contentFragment.appendChild(this.firstChild);
    }
  }

  /**
   * @type {Member["attributeChangedCallback"]["Type"]}
   * @returns {Member["attributeChangedCallback"]["ReturnType"]}
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
   * @type {Member["_updateFromAttribute"]["Type"]}
   * @returns {Member["_updateFromAttribute"]["ReturnType"]}
   */
  _updateFromAttribute() {
    let conditionProperty = this.getAttribute(CONST.conditionAttribute);

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

    if (!conditionProperty.startsWith("$")) {
      this._condition = true;
      this.updateVisibility();
      return;
    }

    conditionProperty = conditionProperty.substring(1);

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
      this._updateCondition(this._parent.attrs[conditionProperty]);
    } else {
      this._state =
        window.Piglet.state[this._parent.__componentKey][
          conditionProperty
        ]._state;
      super.observeState(conditionProperty);
      this._updateCondition(this._state);
    }
  }

  /**
   * @type {Member["_updateCondition"]["Type"]}
   * @returns {Member["_updateCondition"]["ReturnType"]}
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
   * @type {Member["updateVisibility"]["Type"]}
   * @returns {Member["updateVisibility"]["ReturnType"]}
   */
  updateVisibility() {
    if (this._condition && !this._contentMounted) {
      this.appendChild(this._contentFragment);
      this._contentMounted = true;
    } else if (!this._condition && this._contentMounted) {
      this._moveChildrenToFragment();
      this._contentMounted = false;
    }
  }

  _mount(reason) {
    this._updateFromAttribute();
  }

  _update(value) {
    this._updateCondition(value);
  }
}

export default RenderIf;
