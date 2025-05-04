/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */

/**
 * Reactive state accessor object.
 *
 * You can destructure `state` to get individual reactive properties,
 * or call it as a function to dynamically access a property by name.
 *
 * Each property is a reactive reference object with a `.value` getter and setter.
 *
 * @example
 * // Destructuring access
 * const { display, nested } = state;
 * display.value = true;
 * console.log(nested.value.object.hide);
 *
 * @example
 * // Dynamic access
 * const user = state("user");
 * user.value = { name: "Anna" };
 *
 * @typedef {Object<string, StateRef & ((key: string) => StateRef)>} StateProxy
 */

/**
 * @typedef {Object} StateRef<any>
 * @property {any} value - The current value of the state property (reactive).
 */

/** @type {StateProxy} */
let state;

/**
 * Selects an element inside the component's shadow DOM and provides
 * a fluent API for managing event listeners and passing attributes or reactive references.
 *
 * @param {string} selector - A CSS selector for the target element inside shadow DOM.
 * @returns {ElementWrapper} An object with `.on`, `.off`, and `.pass` methods.
 *
 * @example
 * // Basic usage
 * element("#btn").on("click", () => {
 *   console.log("Clicked!");
 * });
 *
 * @example
 * // Using handler reference for later removal
 * const handler = () => console.log("Clicked!");
 * element("#btn").on("click", handler).off("click", handler);
 *
 * @example
 * // Passing attribute
 * element("#box").pass("title", "Tooltip text");
 *
 */

/**
 * @typedef {Object} ElementWrapper
 * @property {(event: string, callback: EventListenerOrEventListenerObject) => ElementWrapper} on - Attaches an event listener.
 * @property {(event: string, callback: EventListenerOrEventListenerObject) => ElementWrapper} off - Removes an event listener.
 * @property {(attrName: string, value: any) => ElementWrapper} pass - Passes a static value  an attribute/property.
 */
let element;

/**
 * Handler for reacting to state changes in a component.
 *
 * This is a Proxy function that routes changes to specific state key handlers.
 * You can register handlers using bracket notation:
 *
 * @example
 * onStateChange['display'] = (newValue, prevValue) => {
 *   nested.value = { object: { hide: newValue } };
 * };
 *
 * When a state change occurs, call:
 *
 * @example
 * onStateChange(newValue, stateKey, prevValue);
 *
 * @param {any} newValue - The new value of the state.
 * @param {any} prevValue - The previous value of that state key.
 *
 * @property {(newValue: any, prevValue: any) => void} [stateKey] - Assignable handler for a specific state key.
 */
let onStateChange;

/**
 * @typedef {Object} ConnectedComponent
 * @property {string} name - The component's constructor name.
 * @property {number|string} id - The component's internal ID (`__componentId`).
 * @property {Object} tree - The component's tracked tree structure (`__tree`).
 * @property {ShadowRoot|null} shadowRoot - The component's shadow root, if present.
 * @property {string} key - Unique component key (`__componentKey`).
 * @property {Function} state - Bound `state` method of the component (for accessing reactive state).
 * @property {typeof ReactiveComponent} element - The actual host element instance.
 * @property {typeof ReactiveComponent|null} parent - The parent custom element hosting this component, if any.
 */
let component;

/**
 * Initializes the state with a default value.
 * @param {any} value - The default value for the state.
 * @returns {any} The initialized state.
 */
let init;

/**
 * Registers a callback to be executed whenever there is an update to the component's state or attributes.
 * This function typically updates the DOM or performs some side effect based on the current state or attributes.
 *
 * @param {Function} callback - The callback function to be executed on each update.
 * The callback will be invoked with no arguments and should contain logic for handling state changes.
 *
 * @example
 * onUpdate(() => {
 *   element("#clickCount").ref.innerText =
 *     `You clicked the button in my parent ${attributes.clickcount} times`;
 * });
 *
 * In this example, the element with the ID `clickCount` is updated with a message
 * that reflects the current value of the `clickcount` attribute.
 */
let $onUpdate;

/** @type {Function} */
let $ref;

/**
 * Handler for reacting to attribute changes on a custom element.
 *
 * This is a Proxy function that dispatches changes to per-attribute callbacks.
 * You can assign handlers using bracket notation:
 *
 * @example
 * onAttributeChange['clickcount'] = (newValue, prevValue) => {
 *   display.value = newValue > 5;
 * };
 *
 * Internally, when the host element detects an attribute change, it should call:
 *
 * @example
 * onAttributeChange(newValue, attributeName, prevValue);
 *
 * @param {any} newValue - The new value of the attribute.
 * @param {any} prevValue - The previous value of the attribute.
 *
 * @property {(newValue: any, prevValue: any) => void} [attributeName] - Assignable handler for a specific attribute.
 */
let onAttributeChange;

/**
 * An object that contains attributes assigned to the component. The `attributes` object
 * is dynamic and can hold any key-value pair representing the attributes passed to the component.
 * These attributes are typically set by the parent component or dynamically assigned.
 * The values can be of any type, including strings, numbers, booleans, or objects.
 *
 * @typedef {Object} Attributes
 * @property {any} [attribute] - A dynamic attribute that can be set by the parent component
 * or modified within the component itself. The key can be any valid attribute name, and the value
 * can be any type.
 * @example
 *
 * console.log(attributes.someAttribute); // Logs the value of the dynamic attribute
 */
let attributes;

/**
 * An object that contains methods forwarded from the parent component.
 * The `forwarded` object exclusively contains methods that are made available
 * by the parent component for the child component to invoke. This allows the
 * child component to call functions or interact with the parent component's behavior
 * or state without directly accessing the parent component.
 *
 * @typedef {Object} ForwardedMethods
 * @property {Function} [methodName] - A method forwarded from the parent component.
 * This method can be called by the child component to perform actions in the parent
 * or retrieve data. The exact methods available depend on the parent component's implementation.
 *
 * @example
 *
 * forwarded.someMethod(); // Calls the `someMethod` function defined in the parent component
 */

/**
 * @type {Record<string, Function>}
 */
let forwarded;

/**
 * Fetches data from a given API path and parses the response into the expected format.
 *
 * @async
 * @function
 * @param {string} path - The relative API endpoint (e.g., "users/1").
 * @param {"json"|"text"|"blob"|"arrayBuffer"|"formData"} [expect="json"] - The expected response type.
 * @returns {Promise<any>} - The parsed response data. If parsing fails, may return plain text as a fallback.
 * @throws {Error} - Throws if fetch fails, if an unsupported `expect` type is provided,
 *                   or if parsing fails entirely.
 *
 * @example
 * const user = await api("users/1"); // parses JSON by default
 *
 * @example
 * const rawText = await
 */
let api;

/**
 * An object to store the route-to-component mappings.
 * Each key is a route path, and each value is the file path to the corresponding component.
 *
 * @type {Object<string, string>}
 */
let routes;

// noinspection JSUnusedGlobalSymbols
/**
 * An object to store route aliases.
 * Each key is a route path, and each value is the alias for the route (usually the component's file name).
 *
 * @type {Object<string, string>}
 */
let routeAliases;