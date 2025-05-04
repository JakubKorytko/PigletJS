/** @import {RenderIfInterface, Virtual, Member} from "@jsdocs/browser/classes/RenderIf.d" */
/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */
/** @typedef {InterfaceMethodTypes<RenderIfInterface>} RenderIfMethods */
import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import { getDeepValue, getHost } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/** @implements {RenderIfInterface} */
class RenderIf extends ReactiveComponent {
  static get observedAttributes() {
    return [CONST.conditionAttribute];
  }
  _condition;
  _fragment;
  _template;

  constructor() {
    super();

    this._condition = false;
    this._negated = false;
    this._parts = [];
    this.__stateless = true;

    this._contentFragment = document.createDocumentFragment();
    this._contentMounted = false;
    this._firstContentMounted = false;

    this.onMount((reason) => {
      if (!this._firstContentMounted) {
        this._firstContentMounted = true;
        this._moveChildrenToFragment();
      }

      super.connectedCallback();

      this._updateFromAttribute();
      this.updateVisibility();
    });

    this.__isHTMLInjected = true;
    this._mount(CONST.reason.onMount);
  }

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
      (!this.__caller || this.__caller.indexOf(CONST.notSettledSuffix) === -1)
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
      const host = getHost(this.__root);
      this._updateCondition(host.__attrs[conditionProperty]);
    } else {
      this._state = this.state(conditionProperty, undefined, true);
      this._updateCondition(this._state.value);
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
    if (this._condition) {
      if (!this._contentMounted) {
        this.appendChild(this._contentFragment);
        this._contentMounted = true;
      }
    } else {
      if (this._contentMounted) {
        this._moveChildrenToFragment();
        this._contentMounted = false;
      }
    }
  }

  /**
   * @type {Member["disconnectedCallback"]["Type"]}
   * @returns {Member["disconnectedCallback"]["ReturnType"]}
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * @type {Member["runScript"]["Type"]}
   * @returns {Member["runScript"]["ReturnType"]}
   */
  runScript() {
    return Promise.resolve(undefined);
  }

  /**
   * @type {Member["onBeforeUpdate"]["Type"]}
   * @returns {Member["onBeforeUpdate"]["ReturnType"]}
   */
  onBeforeUpdate() {}

  /**
   * @type {Member["onAfterUpdate"]["Type"]}
   * @returns {Member["onAfterUpdate"]["ReturnType"]}
   */
  onAfterUpdate() {}
}

export default RenderIf;
