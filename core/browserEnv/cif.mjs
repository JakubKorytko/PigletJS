import ReactiveComponent from "@/core/browserEnv/reactiveComponent";
import { injectTreeTrackingToComponentClass } from "@/core/browserEnv/treeTracking";
import { getDeepValue } from "@/core/browserEnv/helpers";

class CIf extends ReactiveComponent {
  static get observedAttributes() {
    return ["condition"];
  }

  constructor() {
    super();

    this._condition = false;
    this._negated = false;
    this._parts = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateFromAttribute();
    this.updateVisibility();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name === "condition" &&
      oldValue !== newValue &&
      (!this._caller || this._caller.indexOf("_NOT_SETTLED") === -1)
    ) {
      this._updateFromAttribute();
    }
  }

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

  _updateCondition(value) {
    const innerValue = getDeepValue(value, this._parts);
    this._condition = Boolean(innerValue);

    if (this._negated) {
      this._condition = !this._condition;
    }

    this.updateVisibility();
  }

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

injectTreeTrackingToComponentClass(CIf);
customElements.define("c-if", CIf);
