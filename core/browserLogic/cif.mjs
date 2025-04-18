function getDeepValue(obj, pathParts) {
  if (!pathParts) return obj;

  let result = obj;

  for (let i = 0; i < pathParts.length; i++) {
    if (result && result.hasOwnProperty(pathParts[i])) {
      result = result[pathParts[i]];
    } else {
      return undefined;
    }
  }

  return result;
}

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
