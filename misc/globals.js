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
let $state;

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
let $element;

/** @type {Function} */
let $ref;

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
let $attrs;

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
let $api;

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
