/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */

/**
 * @typedef {(node: Node|ShadowRoot, parent?: boolean) => ReactiveComponent|null} GetHost
 * Gets the host component for a given node, returning null if no ReactiveComponent is found.
 */

/**
 * @typedef {(node: Node) => node is ShadowRoot} IsShadowRoot
 * Checks if a given node is a ShadowRoot.
 */

/**
 * @typedef {(obj: object, pathParts: string[]) => any} GetDeepValue
 * Retrieves a deep value from an object using a path (array of keys).
 */

/**
 * @typedef {(str: string) => string} ToPascalCase
 * Converts a string to PascalCase format.
 */

/**
 * @typedef {(name: string) => string} ToPigletAttr
 * Converts a Piglet attribute name to the corresponding HTML attribute format.
 */

/**
 * @typedef {(pigletName: string) => string} FromPigletAttr
 * Converts an HTML attribute name to the corresponding Piglet attribute format.
 */

/**
 * @typedef {(path: string, fetchOptions?: RequestInit, expect?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData') => Promise<any>} Api
 * Makes an API request and returns a promise resolving to the response data.
 */

/**
 * @typedef {(route: string) => boolean} Navigate
 * Navigates to a given route.
 */

/**
 * @typedef {(str: string) => string} ToKebabCase
 * Converts a string to kebab-case format.
 */

/**
 * @typedef {(tagName: string) => Array<ReactiveComponent>} GetMountedComponentsByTag
 * Gets all mounted ReactiveComponent instances for a specific tag name.
 */

/**
 * @typedef {(requestType: string) => void} SendToExtension
 * Sends a request to the extension (e.g., for communication or data).
 */

/**
 * @typedef {(_class: typeof ReactiveComponent) => Promise<CustomElementConstructor>} LoadComponent
 * Loads a component from a given path.
 */

/**
 * @typedef {(url: string) => Promise<string>} FetchWithCache
 * Fetch a resource with a cache.
 */

export /** @exports GetHost */
/** @exports IsShadowRoot */
/** @exports GetDeepValue */
/** @exports ToPascalCase */
/** @exports ToPigletAttr */
/** @exports FromPigletAttr */
/** @exports Api */
/** @exports Navigate */
/** @exports ToKebabCase */
/** @exports GetMountedComponentsByTag */
/** @exports SendToExtension */
/** @exports LoadComponent */
/** @exports FetchWithCache */ {};
