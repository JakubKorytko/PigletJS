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

function resetGlobalPigletData() {
  window.Piglet.tree = {};
  window.Piglet.state = {};
  window.Piglet.componentCounter = 0;
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

export {
  toPascalCase,
  getDeepValue,
  resetGlobalPigletData,
  getComponentDataMethod,
};
