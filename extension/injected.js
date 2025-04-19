function transformComponentState(input) {
  const result = {};

  for (const component in input) {
    const componentData = input[component];
    result[component] = {
      state: {},
      observers: [],
    };

    for (const stateKey in componentData) {
      const stateData = componentData[stateKey];

      // Collect the state
      if (stateData._state !== undefined) {
        result[component].state[stateKey] = stateData._state;
      } else if (stateData._state?.object) {
        result[component].state[stateKey] = stateData._state.object;
      }

      // Collect the observers
      if (stateData._observers) {
        result[component].observers.push(...stateData._observers);
      }
    }
  }

  return result;
}

function observeAppState() {
  const simplifiedState = extractSimpleData(window.Piglet.state);
  const transformedState = transformComponentState(simplifiedState);

  window.postMessage(
    {
      type: "STATE_UPDATE_REQUEST",
      payload: transformedState,
      source: window.location.origin,
    },
    window.location.origin,
  );
}

function observeAppComponentTree() {
  const simplifiedTree = extractSimpleData(window.Piglet.tree);

  window.postMessage(
    {
      type: "TREE_UPDATE_REQUEST",
      payload: simplifiedTree,
      source: window.location.origin,
    },
    window.location.origin,
  );
}

function observePigletStatus() {
  window.postMessage(
    {
      type: "PIGLET_SUPPORT_UPDATE",
      payload: window.Piglet?.allowDebugging,
      source: window.location.origin,
    },
    window.location.origin,
  );
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

setInterval(() => {
  observeAppState();
  observeAppComponentTree();
  observePigletStatus();
}, 1000);
