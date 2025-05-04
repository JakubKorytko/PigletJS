/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */

/**
 * Gets the host component for a given node, returning null if no ReactiveComponent is found.
 * @typedef {(node: Node|ShadowRoot, parent?: boolean) => ReactiveComponent|null} GetHost
 */

/**
 * Checks if a given node is a ShadowRoot.
 * @typedef {(node: Node) => node is ShadowRoot} IsShadowRoot
 */

/**
 * Retrieves a deep value from an object using a path (array of keys).
 * @typedef {(obj: object, pathParts: string[]) => any} GetDeepValue
 */

/**
 * Converts a string to PascalCase format.
 * @typedef {(str: string) => string} ToPascalCase
 */

/**
 * Converts a Piglet attribute name to the corresponding HTML attribute format.
 * @typedef {(name: string) => string} ToPigletAttr
 */

/**
 * Converts an HTML attribute name to the corresponding Piglet attribute format.
 * @typedef {(pigletName: string) => string} FromPigletAttr
 */

/**
 * Makes an API request and returns a promise resolving to the response data.
 * @typedef {(path: string, expect?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData') => Promise<any>} Api
 */

/**
 * Navigates to a given route.
 * @typedef {(route: string) => void} Navigate
 */

/**
 * Converts a string to kebab-case format.
 * @typedef {(str: string) => string} ToKebabCase
 */

/**
 * Fades out an element over a specified duration.
 * @typedef {(element: Partial<ReactiveComponent> | HTMLElement, duration?: number) => Promise<void>} FadeOut
 */

/**
 * Fades in an element over a specified duration.
 * @typedef {(element: Partial<ReactiveComponent> | HTMLElement, duration?: number) => Promise<void>} FadeIn
 */

/**
 * Gets all mounted ReactiveComponent instances for a specific tag name.
 * @typedef {(tagName: string) => Array<ReactiveComponent>} GetMountedComponentsByTag
 */

/**
 * Sends a request to the extension (e.g., for communication or data).
 * @typedef {(requestType: string) => void} SendToExtension
 */

/**
 * Loads a component from a given path.
 * @typedef {(_class: typeof ReactiveComponent) => Promise<CustomElementConstructor>} LoadComponent
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
/** @exports FadeOut */
/** @exports FadeIn */
/** @exports GetMountedComponentsByTag */
/** @exports SendToExtension */
/** @exports LoadComponent */ {};
