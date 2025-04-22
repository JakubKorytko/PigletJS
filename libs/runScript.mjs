// noinspection JSUnusedLocalSymbols,JSUnusedAssignment,JSUnresolvedReference,JSUnusedGlobalSymbols,ThisExpressionReferencesGlobalObjectJS

{
  (function (shadowRoot, hostElement) {
    const element = (selector) => {
      const el = hostElement.shadowRoot.querySelector(selector);
      return {
        on: (event, callback) => {
          el?.addEventListener(event, callback);
          return element(selector);
        },
        off: (event, callback) => {
          el?.removeEventListener(event, callback);
          return element(selector);
        },
        pass: (attrName, value) => {
          if (el && typeof value === "function") {
            if (!el._forwarded) {
              el._forwarded = {};
            }
            el._forwarded[attrName] = value;
            if (el.onAttributeChange)
              el.onAttributeChange("forwarded", el._forwarded);
            if (el.reactive) el.reactive();
          } else {
            el?.setAttribute(attrName, value);
          }
          return element(selector);
        },
        get ref() {
          return el;
        },
      };
    };

    const stateHandlers = {};

    let onStateChange = new Proxy(
      (value, property, prevValue) => {
        const handler = stateHandlers[property];
        if (typeof handler === "function") {
          handler(value, prevValue);
        }
      },
      {
        get(target, prop) {
          return stateHandlers[prop];
        },
        set(target, prop, value) {
          if (typeof value === "function") {
            stateHandlers[prop] = value;
            return true;
          }
          return false;
        },
      },
    );
    const attributeHandlers = {};

    let onAttributeChange = new Proxy(
      (newValue, property, prevValue) => {
        const handler = attributeHandlers[property];
        if (typeof handler === "function") {
          handler(newValue, prevValue);
        }
      },
      {
        get(target, prop) {
          return attributeHandlers[prop];
        },
        set(target, prop, value) {
          if (typeof value === "function") {
            attributeHandlers[prop] = value;
            return true;
          }
          return false;
        },
      },
    );
    let reactive = () => {};
    let onUpdate = (callback) => {
      reactive = callback;
    };

    const state = hostElement.state.bind(hostElement);
    const attributes = hostElement._attrs;
    const forwarded = hostElement._forwarded;
    const onConnect = getComponentDataMethod(hostElement);
    /* COMPONENT CODE */
    hostElement.reactive = reactive;
    hostElement.onStateChange = onStateChange;
    hostElement.onAttributeChange = onAttributeChange;
    reactive();
    onStateChange = undefined;
    onAttributeChange = undefined;
  })(shadowRoot, this);
}
