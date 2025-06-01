/**
 * Transforms the component state into a simplified structure for easier handling.
 * It extracts the state from the provided input object, which represents the state
 * of multiple components, and returns it in a simplified format.
 *
 * @param {Object} input - The input object containing component data.
 * @returns {Object} - The transformed component state.
 */
function transformComponentState(input) {
  const result = {};

  for (const component in input) {
    const componentData = input[component];
    const state = {};

    for (const stateKey in componentData) {
      const stateData = componentData[stateKey];

      if (stateData._state !== undefined) {
        state[stateKey] = stateData._state;
      } else if (stateData._state?.object) {
        state[stateKey] = stateData?._state.object;
      }
    }

    result[component] = state;
  }

  return result;
}

/**
 * Extracts simple data from the provided object, converting complex objects like
 * HTMLElement to simple representations like their `id`, `className`, or `tagName`.
 * Useful for simplifying data structures before sending them across contexts.
 *
 * @param {Object} data - The data to simplify.
 * @returns {Object} - The simplified data.
 */
function extractSimpleData(data) {
  if (data && typeof data === "object") {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value instanceof HTMLElement) {
          return value.id || value.className || value.tagName;
        }
        return value;
      }),
    );
  }
  return data;
}

/**
 * Attempts to set a deeply nested property in an object, but only if the full key path already exists.
 *
 * @param {Object} obj - The object to modify.
 * @param {Array<string|number>} keys - An array representing the path of keys to traverse.
 * @param {*} value - The value to set at the target location.
 * @returns {boolean} Returns `true` if the property was successfully set, or `false` if any key in the path does not exist.
 */
const setDeep = (obj, keys, value) => {
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current?.hasOwnProperty(keys[i])) {
      current = current[keys[i]];
    } else {
      return false;
    }
  }
  const lastKey = keys[keys.length - 1];
  if (current?.hasOwnProperty(lastKey)) {
    current[lastKey] = value;
    return true;
  }
  return false;
};

/**
 * Updates the state of a specific component by setting the new state value.
 *
 * @param {string} key - The key identifying the component.
 * @param {string} stateName - The name of the state to update.
 * @param {any} value - The new value to set for the state.
 * @param {Array<string|number>} path - The path to the specific state property to update.
 */
function updateState(root, key, stateName, value, path) {
  const state = root.globalState[stateName][key];
  if (path.length > 0) {
    setDeep(state._state, path, value);
    state._notify();
  } else {
    state.setState(value);
  }
}

/**
 * Sends a state update to the parent window. This sends the current state of
 * all components after transforming and simplifying it.
 */
function sendStateUpdate(root) {
  const simplifiedState = extractSimpleData(root.globalState);
  const transformedState = transformComponentState(simplifiedState);

  window.postMessage(
    {
      type: "STATE_UPDATE",
      payload: transformedState,
      source: "PIGLET_INJECTED",
    },
    window.location.origin,
  );
}

/**
 * Sends a tree update to the parent window. This sends the current state of
 * the component tree after simplifying it.
 */
function sendTreeUpdate(root) {
  if (!root?.tree) return;
  const simplifiedTree = extractSimpleData(root.tree);

  window.postMessage(
    {
      type: "TREE_UPDATE",
      payload: simplifiedTree,
      source: "PIGLET_INJECTED",
    },
    window.location.origin,
  );
}

/**
 * Sends the initial data (both the state and tree) to the parent window.
 * This is typically used when the extension is first loaded or when a new request is made.
 */
function sendInitialData(root) {
  const simplifiedState = extractSimpleData(root.globalState);
  const transformedState = transformComponentState(simplifiedState);
  const simplifiedTree = extractSimpleData(root.tree);

  window.postMessage(
    {
      type: "INITIAL_DATA",
      payload: {
        state: transformedState,
        tree: simplifiedTree,
      },
      source: "PIGLET_INJECTED",
    },
    window.location.origin,
  );
}

/**
 * Listens for messages from other parts of the extension (e.g., content script) and
 * handles the requests to modify the state or request initial data.
 *
 * @param {MessageEvent} event - The message event containing the data to process.
 */
window.addEventListener("message", (event) => {
  const root = window.pigletExtensionDebugRoot;
  if (!root) return;

  if (!(event.data?.source === "PIGLET_CONTENT")) return;
  if (event.data.type === "INITIAL_REQUEST") {
    sendInitialData(root);
  }
  if (event.data.type === "MODIFY_STATE") {
    const { key, stateName, value, path } = event.data.payload;
    updateState(root, key, stateName, value, path);
  }
});

window.pigletExtensionCallbacks = {
  sendInitialData,
  sendTreeUpdate,
  sendStateUpdate,
};
