/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */

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

/**
 * Prepares a state initializer object to be assigned through `usePig` or `useBoar`.
 * Only triggers initialization if the state does not already exist.
 *
 * @param {any} initialValue - The initial value to use for the state if it is not yet created.
 * @returns {{ __piglet_use_marker: true, initialValue: any }} An internal marker object used to signal lazy initialization.
 */
let $$;

/**
 * A Proxy interface to create or access stateful properties with shallow reference semantics.
 * - First-time assignment to a property using `use(...)` will initialize state with the given value.
 * - Later assignments update `.value`, or merge and notify if the value is an object.
 * - Direct reads return the current `.value`.
 *
 * @type {Record<string, any>} Automatically populated stateful properties via proxy behavior.
 */
let $P;

/**
 * A Proxy interface like `usePig`, but initializes state with `asRef = true` (deep reference/reactivity support).
 * - Behaves the same as `usePig` in terms of property interaction.
 * - Enables deeper reactive bindings for frameworks or watchers that rely on ref-like access.
 *
 * @type {Record<string, any>} Automatically populated stateful properties via proxy behavior.
 */
let $B;

/**
 * [This is the same interface as `$P` but supports deep reactivity]
 * A Proxy interface to create or access stateful properties with shallow reference semantics.
 * - First-time assignment to a property using `use(...)` will initialize state with the given value.
 * - Later assignments update `.value`, or merge and notify if the value is an object.
 * - Direct reads return the current `.value`.
 *
 * @type {Record<string, any>} Automatically populated stateful properties via proxy behavior.
 */
let $$P;
