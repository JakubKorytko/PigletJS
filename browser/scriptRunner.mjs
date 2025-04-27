/**
 * @typedef {Object} ShadowDomElement
 * @property {(event: string, callback: EventListener) => ReturnType<typeof queryElement>} on
 * @property {(event: string, callback: EventListener) => ReturnType<typeof queryElement>} off
 * @property {(attrName: string, value: any) => ReturnType<typeof queryElement>} pass
 * @property {typeof ReactiveComponent|Element|null} ref
 */

/**
 * Queries a shadow DOM element inside a host element and provides helper methods
 * for event binding, attribute setting, and direct reference access.
 *
 * @param {typeof ReactiveComponent} hostElement - The host custom element containing the shadowRoot.
 * @param {string} selector - The CSS selector used to find the element inside shadowRoot.
 * @returns {ShadowDomElement}
 */
const queryElement = (hostElement, selector) => {
  const el = hostElement.shadowRoot.querySelector(selector);
  return {
    on(event, callback) {
      el?.addEventListener(event, callback);
      return queryElement(hostElement, selector);
    },
    off(event, callback) {
      el?.removeEventListener(event, callback);
      return queryElement(hostElement, selector);
    },
    pass(attrName, value) {
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
      return queryElement(hostElement, selector);
    },
    get ref() {
      return el;
    },
  };
};

/**
 * Creates proxy handlers for listening and reacting to state and attribute changes
 * inside a component.
 *
 * Each proxy allows registering callbacks dynamically for specific property names.
 *
 * @returns {{
 *   onStateChange: Proxy<(value: any, property: string, prevValue: any) => void>,
 *   onAttributeChange: Proxy<(newValue: any, property: string, prevValue: any) => void>
 * }}
 */
function getCallbackProxies() {
  const stateHandlers = {};
  const attributeHandlers = {};

  const onStateChange = new Proxy(
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

  const onAttributeChange = new Proxy(
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

  return { onStateChange, onAttributeChange };
}

/**
 * Generates an object containing component metadata and callback helpers
 * for a given host custom element.
 *
 * This is used to wire up reactive behavior, state updates, and attribute forwarding.
 *
 * @param {typeof ReactiveComponent} hostElement - The custom element instance to extract data from.
 * @returns {{
 *   component: {
 *     name: string,
 *     id: number,
 *     tree: any,
 *     shadowRoot: ShadowRoot|null,
 *     key: string,
 *     state: Function,
 *     element: typeof ReactiveComponent,
 *     parent: typeof ReactiveComponent|null|Element,
 *     attributes: Object,
 *     forwarded: Object
 *   },
 *   callbacks: {
 *     onStateChange: Proxy,
 *     onAttributeChange: Proxy,
 *     onUpdate: (callback: Function) => void,
 *     reactiveRef: { value: Function },
 *     element: (selector: string) => ReturnType<typeof queryElement>
 *   }
 * }}
 */
function generateComponentData(hostElement) {
  const reactiveRef = {
    value: () => {},
  };

  // noinspection JSUnusedGlobalSymbols
  return {
    component: {
      name: hostElement.constructor.name,
      id: hostElement.__componentId,
      tree: hostElement.__tree,
      shadowRoot: hostElement.shadowRoot,
      key: hostElement.__componentKey,
      state: hostElement.state.bind(hostElement),
      element: hostElement,
      parent: hostElement.getRootNode().host,
      attributes: hostElement._attrs,
      forwarded: hostElement._forwarded,
    },
    callbacks: {
      ...getCallbackProxies(),
      onUpdate: (callback) => {
        reactiveRef.value = callback;
      },
      reactiveRef,
      element: queryElement.bind(this, hostElement),
    },
  };
}

/**
 * Binds reactive callbacks and clears attribute queues for a component
 * after mounting.
 *
 * Used internally after scriptRunner initializes component logic.
 *
 * @param {typeof ReactiveComponent} hostElement - The host custom element.
 * @param {{
 *   reactiveRef: { value: Function },
 *   onStateChange: Proxy,
 *   onAttributeChange: Proxy
 * }} callbacks - The reactive references and proxies generated earlier.
 * @returns {void}
 */
function componentMountCleanup(
  hostElement,
  { reactiveRef, onStateChange, onAttributeChange },
) {
  hostElement.reactive = reactiveRef.value;
  hostElement.onStateChange = onStateChange;
  hostElement.onAttributeChange = onAttributeChange;
  hostElement._clearAttributesQueue();
  hostElement.reactive();
}

/**
 * Executes a module script against a custom element instance,
 * setting up reactive behavior, state watchers, and event forwarding.
 *
 * The module must export a default function that will receive
 * the component structure and callback utilities.
 *
 * @param {typeof ReactiveComponent} hostElement - The host custom element.
 * @param {any} module - The imported module containing the default initialization function.
 * @returns {void}
 */
function scriptRunner(hostElement, module) {
  if (typeof module.default !== "function") {
    return;
  }

  hostElement.onMount(() => {
    const { component, callbacks } = generateComponentData(hostElement);

    module.default({ ...component, ...callbacks, component });

    componentMountCleanup(hostElement, callbacks);
  });
}

export default scriptRunner;
