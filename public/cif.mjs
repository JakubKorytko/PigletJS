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

class CIf extends HTMLElement {
  static get observedAttributes() {
    return ["condition"];
  }

  updateState() {
    let conditionProperty = this.getAttribute("condition");

    if (conditionProperty.startsWith("!")) {
      conditionProperty = conditionProperty.substring(1);
    }

    const parts = conditionProperty.split(".");

    if (parts.length > 1) {
      conditionProperty = parts[0];
      this._parts = parts.slice(1);
    }

    const [addObserver, removeObserver] = useObserver(
      this._caller,
      conditionProperty,
    );

    if (removeObserver) {
      removeObserver(this);
    }
    this.state = useState(this._caller, conditionProperty);

    addObserver(this);
  }

  constructor() {
    super();
    this._caller = this.getAttribute("host__element") ?? "global";
    this.removeAttribute("host__element");
    this._condition = false;
    this.updateState();
  }

  connectedCallback() {
    this.updateVisibility();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "condition") {
      let conditionProperty = this.getAttribute("condition");

      let negated = false;
      if (conditionProperty.startsWith("!")) {
        negated = true;
        conditionProperty = conditionProperty.substring(1);
      }

      this.updateState();

      this.setConditionFromState(conditionProperty, negated);
    }
  }

  setConditionFromState(propertyName, negated) {
    const stateValue = this.state.value;

    this._condition = Boolean(getDeepValue(stateValue, this._parts));

    if (negated) {
      this._condition = !this._condition;
    }

    this.updateVisibility();
  }

  updateVisibility() {
    if (this._condition) {
      this.style.display = "block";
    } else {
      this.style.display = "none";
    }
  }

  // Update method called when state changes
  update(newState) {
    console.log("State updated:", newState);
    // Zmieniamy metodę, by sprawdzała nazwę właściwości z atrybutu 'condition' w 'newState'
    let conditionProperty = this.getAttribute("condition"); // Pobierz nazwę właściwości z atrybutu

    let negated = false;
    if (conditionProperty.startsWith("!")) {
      negated = true;
      conditionProperty = conditionProperty.substring(1); // Usuwamy "!" z nazwy
    }

    this.setConditionFromState(conditionProperty, negated); // Sprawdzamy nową wartość na podstawie nazwy właściwości
    this.updateVisibility();
  }
}

customElements.define("c-if", CIf);
