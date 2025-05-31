/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
/** @import {ElementProxy} from "@jsdocs/browser/scriptRunner.d" */
/** @import CONST from "@Piglet/browser/CONST" */

/**
 * @template T
 * @param {string|HTMLElement|ReactiveComponent|ReactiveDummyComponent} nodeOrSelector
 * @param {T & Element} [expect] - The expected type of the element. If not provided, defaults to `HTMLElement`.
 * @returns {(ElementProxy & T & HTMLElement | null)}
 */
function $element(nodeOrSelector, expect) {}

/** @type {(selector: string) => (ElementProxy & HTMLElement | null)[]} */
let $elements;

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
 * @param {RequestInit} [fetchOptions={}] - Optional fetch options to customize the request.
 * @param {"json"|"text"|"blob"|"arrayBuffer"|"formData"|"raw"} [expect="raw"] - The expected response type.
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

/**
 * Callback called before the component is updated.
 * If the callback returns `false`, the update is canceled.
 * @type {Function} $onBeforeUpdate
 * @param {() => boolean} callback - Callback function to be executed before the update.
 */
let $onBeforeUpdate;

/**
 * Callback called after the component is updated.
 * This is useful for performing actions after the DOM has been updated.
 * @type {Function} $onAfterUpdate
 * @param {() => void} callback - Callback function to be executed after the update.
 */
let $onAfterUpdate;

/**
 * A reference to the document object, typically the shadow DOM of the component.
 * This is used to access the component's DOM elements and perform operations on them.
 * @type {Document} $document
 */
let $document;

/**
 * A reference to the current component instance.
 * This is used to access the component's properties and methods directly.
 * @type {ReactiveComponent|ReactiveDummyComponent}
 */
let $this;

/**
 * Value used to stop the execution of the component script.
 * @type {typeof CONST.stopComponentScriptExecution}
 */
let out;

/**
 * Template literal for creating elements within the component.
 * @type {(strings: TemplateStringsArray, ...values: any[]) => HTMLElement}
 */
let $;
