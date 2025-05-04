/** @import RenderIfInterface from "@jsdocs/browser/classes/RenderIf.d" */

/**
 * @template T
 * @typedef {keyof T} MethodKeys
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef {T[K]} MethodType
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef {ReturnType<T[K] extends (...args: any) => any ? T[K] : never>} MethodReturn
 */

/**
 * Helper type that returns Type and ReturnType for all methods of an interface
 * @template T
 * @typedef {{
 *   [K in keyof T]: {
 *     Type: MethodType<T, K>,
 *     ReturnType: MethodReturn<T, K>
 *   }
 * }} InterfaceMethodTypes
 */

/*
 * Example usage:
 * @typedef {InterfaceMethodTypes<RenderIfInterface>} RenderIfMethods
 * This creates a type with entries like:
 * {
 *   attributeChangedCallback: {
 *     Type: (name?: string, oldValue?: string|null, newValue?: string) => void,
 *     ReturnType: void
 *   },
 *   onStateChange: {
 *     Type: (value?: unknown, property?: string, prevValue?: unknown) => void,
 *     ReturnType: void
 *   },
 *   ...
 * }
 */

export /** @exports MethodKeys */
/** @exports MethodType */
/** @exports MethodReturn */
/** @exports InterfaceMethodTypes */ {};
