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
 * @typedef {Object<string, StateRef<any>> & ((key: string) => StateRef<any>)} StateProxy
 */

/**
 * @typedef {Object} StateRef<any>
 * @property {any} value - The current value of the state property (reactive).
 */

/** @type {StateProxy} */
var state;

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
var element;

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
var onStateChange;

/**
 * Asynchronously executes a callback once the host component is connected and available.
 * Uses `queueMicrotask` to ensure DOM setup is completed before executing the callback.
 *
 * @param {function(Object): void} callback - A function that receives the connected component's metadata.
 *   The `component` object passed to the callback contains:
 *   @property {string} name - The component's constructor name.
 *   @property {number|string} id - The component's internal ID (`__componentId`).
 *   @property {Object} tree - The component's tracked tree structure (`__tree`).
 *   @property {ShadowRoot|null} shadowRoot - The component's shadow root, if present.
 *   @property {string} key - Unique component key (`__componentKey`).
 *   @property {Function} state - Bound `state` method of the component (for accessing reactive state).
 *   @property {HTMLElement} element - The actual host element instance.
 *   @property {HTMLElement|null} parent - The parent custom element hosting this component, if any.
 */
var onConnect;

/**
 * Initializes the state with a default value.
 * @param {any} value - The default value for the state.
 * @returns {any} The initialized state.
 */
var init;

/**
 * Registers a callback to be executed whenever there is an update to the component's state or attributes.
 * This function typically updates the DOM or performs some side-effect based on the current state or attributes.
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
var onUpdate;

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
var onAttributeChange;

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
var attributes;

/**
 * An object that contains methods forwarded from the parent component.
 * The `forwarded` object exclusively contains methods that are made available
 * by the parent component for the child component to invoke. This allows the
 * child component to call functions or interact with the parent component's behavior
 * or state without directly accessing the parent component.
 *
 * @typedef {Object} ForwardedMethods
 * @property {Function}  - A method forwarded from the parent component.
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
var forwarded;
