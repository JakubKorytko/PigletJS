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
 * a fluent API for managing event listeners.
 *
 * @param {string} selector - A CSS selector for the target element inside shadow DOM.
 * @returns {ElementWrapper} An object with `.on` and `.off` methods for managing listeners.
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
 * // Chaining calls
 * element("#btn")
 *   .on("mouseenter", () => console.log("hovered"))
 *   .on("mouseleave", () => console.log("unhovered"));
 */

/**
 * @typedef {Object} ElementWrapper
 * @property {(event: string, callback: EventListenerOrEventListenerObject) => ElementWrapper} on - Attaches an event listener.
 * @property {(event: string, callback: EventListenerOrEventListenerObject) => ElementWrapper} off - Removes an event listener.
 */
var element;

/**
 * Called when the component's state changes.
 *
 * @param {*} value - The new value of the state that was changed.
 * @param {string} property - The name of the property whose state has changed.
 */
var onStateChange;
