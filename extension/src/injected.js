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
        state[stateKey] = stateData._state.object;
      }
    }

    result[component] = state;
  }

  return result;
}

function extractSimpleData(data) {
  if (data && typeof data === "object") {
    const cleanedData = JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (value instanceof HTMLElement) {
          return value.id || value.className || value.tagName;
        }
        return value;
      }),
    );
    return cleanedData;
  }
  return data;
}

function updateState(key, stateName, value) {
  window.Piglet.state[stateName][key].setState(value);
}

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

if (window.Piglet) {
  window.Piglet.extension = {
    sendInitialData,
    sendTreeUpdate,
    sendStateUpdate,
  };
}

window.addEventListener("message", (event) => {
  if (!event.data?.source === "PIGLET_CONTENT") return;
  if (event.data.type === "INITIAL_REQUEST") {
    sendInitialData();
  }
  if (event.data.type === "MODIFY_STATE") {
    const { key, stateName, value } = event.data.payload;
    updateState(key, stateName, value);
  }
});
