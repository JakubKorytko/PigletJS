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

/**
 * Converts a PascalCase or camelCase string to kebab-case.
 *
 * @param {string} str - The string to convert.
 * @returns {string}
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Fades out an element by gradually reducing its opacity to 0.
 *
 * @param {typeof ReactiveComponent & HTMLElement} element - The element to fade out.
 * @param {number} [duration=400] - The duration of the fade out in milliseconds.
 * @returns {Promise<void>} A promise that resolves when the fade out is complete.
 */
function fadeOut(element, duration = 400) {
  return new Promise((resolve) => {
    element.style.opacity = "1";
    element.style.transition = `opacity ${duration}ms`;

    void element.offsetWidth;

    element.style.opacity = "0";

    const handleTransitionEnd = (event) => {
      if (event.propertyName === "opacity") {
        element.removeEventListener("transitionend", handleTransitionEnd);
        element.style.display = "none";
        resolve();
      }
    };

    element.addEventListener("transitionend", handleTransitionEnd);
  });
}

/**
 * Fades in an element by gradually increasing its opacity to 1.
 *
 * @param {typeof ReactiveComponent & HTMLElement} element - The element to fade in.
 * @param {number} [duration=400] - The duration of the "fade in" in milliseconds.
 * @returns {Promise<void>} A promise that resolves when the fade in is complete.
 */
function fadeIn(element, duration = 400) {
  return new Promise((resolve) => {
    element.style.opacity = "0";
    element.style.display = "";

    void element.offsetWidth;

    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = "1";

    const handleTransitionEnd = (event) => {
      if (event.propertyName === "opacity") {
        element.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      }
    };

    element.addEventListener("transitionend", handleTransitionEnd);
  });
}

/**
 * Retrieves all mounted component instances that match a given tag name.
 *
 * This function searches through the `window.Piglet.mountedComponents` set
 * and returns the `.ref` property of each component whose `tag` matches
 * the provided `tagName` (case-insensitive).
 *
 * @param {string} tagName - The tag name of the components to find (e.g., "my-component").
 * @returns {Array<typeof ReactiveComponent>} An array of references (`.ref`) to the matching mounted components.
 */
function getMountedComponentsByTag(tagName) {
  const componentRefs = [];

  if (!window.Piglet?.mountedComponents?.size) return componentRefs;

  for (const mountedComponent of window.Piglet.mountedComponents) {
    if (mountedComponent.tag.toLowerCase() === tagName.toLowerCase()) {
      componentRefs.push(mountedComponent.ref);
    }
  }

  return componentRefs;
}

export {
  toPascalCase,
  getDeepValue,
  api,
  navigate,
  toKebabCase,
  fadeOut,
  fadeIn,
  getMountedComponentsByTag,
};
