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

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

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

export { toPascalCase, getDeepValue, getComponentDataMethod, api };
