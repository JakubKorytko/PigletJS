/**
 * Retrieves a deeply nested value from an object using a path array.
 * @param {object} obj - The object to extract the value from.
 * @param {string[]} pathParts - An array of keys representing the path to the value.
 * @returns {*} - The value at the specified path, or undefined if not found.
 */
function getDeepValue(obj, pathParts) {
  if (!pathParts) return obj;

  let result = obj;

  for (let i = 0; i < pathParts.length; i++) {
    if (result && result.hasOwnProperty(pathParts[i])) {
      result = result[pathParts[i]];
    } else {
      return undefined;
    }
  }

  return result;
}

/**
 * Converts a kebab-case or snake_case string to PascalCase.
 * @param {string} str - The input string.
 * @returns {string} - The converted PascalCase string.
 */
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

/**
 * Returns a method that retrieves metadata from a custom component.
 * @param {ReactiveComponent} hostElement - The custom element instance.
 * @returns {(callback: (data: object) => void) => Promise<void>} - Async function passing component data to a callback.
 */
function getComponentDataMethod(hostElement) {
  return async (callback) => {
    new Promise((resolve) => {
      queueMicrotask(() => {
        const component = {
          name: hostElement.constructor.name,
          id: hostElement.__componentId,
          tree: hostElement.__tree,
          shadowRoot: hostElement.shadowRoot,
          key: hostElement.__componentKey,
          state: hostElement.state.bind(hostElement),
          element: hostElement,
          parent: hostElement.getRootNode().host,
          attributes: hostElement._attrs,
        };
        resolve(component);
      });
    }).then((component) => {
      callback(component);
    });
  };
}

/**
 * Makes a request to a given API path and parses the response based on expected type.
 * @param {string} path - The API path (without leading `/api/`).
 * @param {'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'} [expect='json'] - The expected response type.
 * @returns {Promise<*>} - The parsed response data.
 * @throws {Error} - Throws if fetching or parsing fails.
 */
async function api(path, expect = "json") {
  const url = `/api/${path.replace(/^\/+/, "")}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  }

  const contentType = res.headers.get("Content-Type") || "";
  const expected = expect.toLowerCase();

  const parsers = {
    json: () => res.json(),
    text: () => res.text(),
    blob: () => res.blob(),
    arrayBuffer: () => res.arrayBuffer(),
    formData: () => res.formData(),
  };

  const parse = parsers[expected];

  if (!parse) {
    throw new Error(`Unsupported expect type: "${expect}"`);
  }

  try {
    const data = await parse();
    if (!contentType.includes(expected)) {
      Piglet.log(
        `Warning: Expected response type "${expected}", but got "${contentType}".`,
        "warn",
      );
    }
    return data;
  } catch (err) {
    try {
      const fallback = await res.text();
      Piglet.log(
        `Warning: Failed to parse as "${expected}". Response returned as plain text.`,
        "warn",
      );
      return fallback;
    } catch {
      throw new Error(`Failed to parse response as "${expected}" from ${url}`);
    }
  }
}

/**
 * Navigates to a new route within the application by updating the browser history
 * and setting the `route` property on the root component.
 *
 * This function assumes that `window.Piglet.tree` contains a tracked component tree,
 * and that the root component has the name `"AppRoot"` and a `route` property.
 *
 * @param {string} route - The new route path to navigate to (e.g., "/about", "/dashboard").
 */
const navigate = (route) => {
  if (!window.Piglet.tree) return;

  const root = Object.values(window.Piglet.tree)[0];

  if (root.componentName !== "AppRoot") return;

  window.history.pushState({}, "", route);

  root.element.route = route;
};

export { toPascalCase, getDeepValue, getComponentDataMethod, api, navigate };
