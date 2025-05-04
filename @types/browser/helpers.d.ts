/** Fades in an element over a specified duration */
export function fadeIn(element: HTMLElement, duration: number): Promise<void>;

/** Fades out an element over a specified duration */
export function fadeOut(element: HTMLElement, duration: number): Promise<void>;

/** Converts a string to PascalCase format */
export function toPascalCase(str: string): string;

/** Converts a Piglet attribute name to the corresponding HTML attribute format */
export function toPigletAttr(name: string): string;

/** Converts an HTML attribute name to the corresponding Piglet attribute format */
export function fromPigletAttr(name: string): string;

/** Makes an API request and returns a promise resolving to the response data */
export function api(
  path: string,
  expect?: "json" | "text" | "blob" | "arrayBuffer" | "formData",
): Promise<any>;

/** Navigates to a given route */
export function navigate(route: string): void;

/** Converts a string to kebab-case format */
export function toKebabCase(str: string): string;

/** Retrieves a deep value from an object using a path (array of keys) */
export function getDeepValue(obj: object, pathParts: string[]): any;

/** Retrieves the host component for a given node, returning null if no ReactiveComponent is found */
export function getMountedComponentsByTag(
  tagName: string,
): Array<ReactiveComponent>;

/** Retrieves the host component for a given node, returning null if no ReactiveComponent is found */
export function getHost(node: Node): HTMLElement | ShadowRoot | null;

/** Retrieves a deep value from an object using a path (array of keys) */
export function getDeepValue(obj: object, pathParts: string[]): any;

/** Checks if a given node is a ShadowRoot */
export function isShadowRoot(node: Node): boolean;

/** Sends a message to the extension */
export function sendToExtension(message: string): void;

/** Loads a component from a given path */
export function loadComponent(
  component: typeof ReactiveComponent,
): Promise<CustomElementConstructor>;
