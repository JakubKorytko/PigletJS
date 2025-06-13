import { AppRoot } from "./classes/index.d";

type Navigate = (route: string) => boolean;
type FetchWithCache = (url: string) => Promise<string>;

/** Converts a string to PascalCase format */
export function toPascalCase(str: string): string;

/** Makes an API request and returns a promise resolving to the response data */
export function api(
  path: string,
  fetchOptions: RequestInit = {},
  expect?:
    | "json"
    | "text"
    | "blob"
    | "arrayBuffer"
    | "formData"
    | "raw" = "raw",
): Promise<any>;

/** Navigates to a given route */
export function navigate(
  route: string,
  options?: { condition: boolean; fallback?: string },
): boolean;

/** Converts a string to kebab-case format */
export function toKebabCase(str: string): string;

/** Retrieves a deep value from an object using a path (array of keys) */
export function getDeepValue(obj: object, pathParts: string[]): any;

/** Retrieves the host component for a given node, returning null if no ReactiveComponent is found */
export function getMountedComponentsByTag(
  tagName: string,
  root: AppRoot,
): Array<ReactiveComponent>;

/** Retrieves a deep value from an object using a path (array of keys) */
export function getDeepValue(obj: object, pathParts: string[]): any;

/** Sends a message to the extension */
export function sendToExtension(message: string, root: AppRoot): void;

/** Fetch a resource with a cache */
export function fetchWithCache(url: string, root: AppRoot): Promise<string>;

/** Loads a component from a given path */
export function loadComponent(
  component: typeof ReactiveComponent,
): Promise<CustomElementConstructor>;

export type { FetchWithCache, Navigate };
