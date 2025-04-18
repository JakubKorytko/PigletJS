class ReactiveComponent extends HTMLElement {
  constructor() {
    super();

    this._caller = this.getAttribute("host__element");
    this.removeAttribute("host__element");

    this._componentName = this.constructor.name;
    this._observers = new Map();

    assignComponentIdToElement(this);

    this.__componentKey = `${this.constructor?.name}${this.__componentId}`;
  }

  connectedCallback() {
    console.log(`${this._componentName} connected`);
    this.__root = this.shadowRoot ?? this.getRootNode();
    if (this._caller) this._caller = this.__root.host.__componentKey;
  }

  observeState(property) {
    const callback = {
      stateChange: (value) => this.stateChange(value, property),
    };

    const [addObserver, removeObserver] = useObserver(
      this._caller ?? this.__componentKey,
      property,
    );

    if (this._observers.has(property)) {
      const oldRemove = this._observers.get(property);
      oldRemove?.(this);
    }

    addObserver(callback);
    this._observers.set(property, () => removeObserver(callback));
  }

  state(property, initialValue) {
    const state = useState(
      this._caller ?? this.__componentKey,
      property,
      initialValue,
    );
    this.observeState(property);
    return state;
  }

  stateChange(value, property) {
    if (typeof this.onStateChange === "function") {
      this.onStateChange(value, property);
    } else {
      console.warn(
        `[${this._caller ?? this.__componentKey}] onStateChange not implemented for:`,
        property,
      );
    }
  }

  disconnectedCallback() {
    for (const remove of this._observers.values()) {
      remove?.(this);
    }
    this._observers.clear();
  }
}
