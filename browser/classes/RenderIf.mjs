import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import { getDeepValue } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/**
 * `<render-if>` is a conditional rendering component.
 * It shows or hides itself based on the evaluation of a given boolean state or expression.
 * The `condition` attribute can be a boolean literal, a state key, or a state path (e.g., `user.loggedIn`).
 * Negation is supported by prefixing the condition with `!`.
 */
class RenderIf extends ReactiveComponent {
  // noinspection JSUnusedGlobalSymbols
  static get observedAttributes() {
    return [CONST.conditionAttribute];
  }

  constructor() {
    super();

    this._condition = false;
    this._negated = false;
    this._parts = [];
    this._stateless = true;

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

    this._isHTMLInjected = true;
    this._mount(CONST.reason.onMount);
  }

  _moveChildrenToFragment() {
    while (this.firstChild) {
      this._contentFragment.appendChild(this.firstChild);
    }
  }

  /**
   * Called when an observed attribute is changed.
   * @param {string} name - Attribute name.
   * @param {string | null} oldValue - Previous value.
   * @param {string | null} newValue - New value.
   */
  // noinspection JSUnusedGlobalSymbols
  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name === CONST.conditionAttribute &&
      oldValue !== newValue &&
      (!this._caller || this._caller.indexOf(CONST.notSettledSuffix) === -1)
    ) {
      this._updateFromAttribute();
    }
  }

  /**
   * Parses the `condition` attribute and sets internal state tracking.
   * Supports boolean literals, state paths, and negation (!).
   * @private
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
      this._updateCondition(this.__root.host._attrs[conditionProperty]);
    } else {
      this._state = this.state(conditionProperty, undefined, true);
      this._updateCondition(this._state.value);
    }
  }

  /**
   * Updates the condition based on the latest value and visibility rules.
   * @param {*} value - The state value to evaluate.
   * @private
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
   * Reacts to changes in the observed state.
   * @param {*} value - The updated value of the observed state.
   */
  onStateChange(value) {
    if (["true", "false"].includes(this.getAttribute(CONST.conditionAttribute)))
      return;
    this._updateCondition(value);
  }

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

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export default RenderIf;
