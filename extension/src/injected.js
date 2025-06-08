let previousState;

/**
 * @typedef {{
 * globalState: Object<string, any>,
 * herd: {
 *   globalState: Object<string, any>,
 * },
 * __componentName: string,
 * }} PigletMinimalComponentProperties
 */

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
    let state = {};

    for (const stateKey in componentData) {
      const stateData = componentData[stateKey];

      if (stateData._state !== undefined) {
        state[stateKey] = stateData._state;
      } else if (stateKey === "_state") {
        state = extractSimpleData(stateData);
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
 * @param {PigletMinimalComponentProperties} root - The root object containing the global state and Herd state.
 * @param {string} key - The key identifying the component.
 * @param {string} stateName - The name of the state to update.
 * @param {any} value - The new value to set for the state.
 * @param {Array<string|number>} path - The path to the specific state property to update.
 */
function updateState(root, key, stateName, value, path) {
  let state;

  if (stateName === "Herd") {
    if (root.__componentName === "Herd") {
      state = root.globalState[key];
    } else {
      state = root.herd.globalState[key];
    }
  } else {
    state = root.globalState[stateName][key];
  }

  if (!state) {
    console.error(
      `State "${stateName}" with key "${key}" not found in global state.`,
    );
    return;
  }

  if (path.length > 0) {
    setDeep(state._state, path, value);
    state._notify();
  } else {
    state.setState(value);
  }

  previousState = mergeHerdWithGlobalState(root);
}

/**
 * Merges the global state and the Herd state into a single object.
 * This function simplifies and transforms the global state and Herd state,
 * then combines them into a unified structure.
 *
 * @param {PigletMinimalComponentProperties} root - The root object containing the global state and Herd state.
 * @returns {Object} - The merged state object, including both the global state and Herd state.
 */
const mergeHerdWithGlobalState = (root) => {
  const simplifiedState = extractSimpleData(root.globalState);
  const transformedState = transformComponentState(simplifiedState);

  const newState =
    typeof transformedState === "object"
      ? { ...transformedState }
      : transformedState;

  if (root.__componentName === "Herd") {
    return typeof previousState === "object"
      ? { ...previousState, Herd: newState }
      : { Herd: newState };
  }

  previousState = newState;

  const simplifiedHerd = extractSimpleData(root.herd.globalState);
  const transformedHerd = transformComponentState(simplifiedHerd);

  const herdState =
    typeof transformedHerd === "object"
      ? { ...transformedHerd }
      : transformedHerd;

  if (typeof transformedState === "object") {
    return { ...transformedState, Herd: herdState };
  }

  return { Herd: herdState };
};

/**
 * Sends a state update to the parent window. This sends the current state of
 * all components after transforming and simplifying it.
 */
function sendStateUpdate(root) {
  window.postMessage(
    {
      type: "STATE_UPDATE",
      payload: mergeHerdWithGlobalState(root),
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
  const simplifiedTree = extractSimpleData(root.tree);

  window.postMessage(
    {
      type: "INITIAL_DATA",
      payload: {
        state: mergeHerdWithGlobalState(root),
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

// noinspection JSUnusedGlobalSymbols
window.pigletExtensionCallbacks = {
  sendInitialData,
  sendTreeUpdate,
  sendStateUpdate,
};
