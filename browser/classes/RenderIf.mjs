import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import { getDeepValue } from "@Piglet/browser/helpers";

/**
 * `<render-if>` is a conditional rendering component.
 * It shows or hides itself based on the evaluation of a given boolean state or expression.
 * The `condition` attribute can be a boolean literal, a state key, or a state path (e.g., `user.loggedIn`).
 * Negation is supported by prefixing the condition with `!`.
 */
class RenderIf extends ReactiveComponent {
  // noinspection JSUnusedGlobalSymbols
  static get observedAttributes() {
    return ["condition"];
  }

  constructor() {
    super();

    this._condition = false;
    this._negated = false;
    this._parts = [];

    this.onMount(() => {
      super.connectedCallback();
      this._updateFromAttribute();
      this.updateVisibility();
    });
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
      name === "condition" &&
      oldValue !== newValue &&
      (!this._caller || this._caller.indexOf("_NOT_SETTLED") === -1)
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
    let conditionProperty = this.getAttribute("condition");

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

    const parts = conditionProperty.split(".");

    if (parts.length > 1) {
      this._parts = parts.slice(1);
      conditionProperty = parts[0];
    } else {
      this._parts = [];
    }

    this._state = this.state(conditionProperty);
    this._updateCondition(this._state.value);
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
    if (["true", "false"].includes(this.getAttribute("condition"))) return;
    this._updateCondition(value);
  }

  updateVisibility() {
    this.style.display = this._condition ? "block" : "none";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export default RenderIf;
