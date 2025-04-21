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

window._extSetState = (key, stateName, value) => {
  window.Piglet.state[stateName][key].setState(value);
};

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const { type, payload } = event.data || {};

  if (type === "EXT_SET_STATE") {
    const { key, stateName, value } = payload;
    window._extSetState(key, stateName, value);
  }
});

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
