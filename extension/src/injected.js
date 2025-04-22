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
 * Updates the state of a specific component by setting the new state value.
 *
 * @param {string} key - The key identifying the component.
 * @param {string} stateName - The name of the state to update.
 * @param {any} value - The new value to set for the state.
 */
function updateState(key, stateName, value) {
  window.Piglet.state[stateName][key].setState(value);
}

/**
 * Sends a state update to the parent window. This sends the current state of
 * all components after transforming and simplifying it.
 */
function sendStateUpdate() {
  const simplifiedState = extractSimpleData(window.Piglet.state);
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
function sendTreeUpdate() {
  const simplifiedTree = extractSimpleData(window.Piglet.tree);

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
function sendInitialData() {
  const simplifiedState = extractSimpleData(window.Piglet.state);
  const transformedState = transformComponentState(simplifiedState);
  const simplifiedTree = extractSimpleData(window.Piglet.tree);

  window.postMessage(
    {
      type: "INITIAL_DATA",
      payload: {
        state: transformedState,
        tree: simplifiedTree,
        allowDebugging: window.Piglet?.allowDebugging,
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
  if (!(event.data?.source === "PIGLET_CONTENT")) return;
  if (event.data.type === "INITIAL_REQUEST") {
    sendInitialData();
  }
  if (event.data.type === "MODIFY_STATE") {
    const { key, stateName, value } = event.data.payload;
    updateState(key, stateName, value);
  }
});
