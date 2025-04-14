function observeAppState() {
  const simplifiedState = extractSimpleData(window.AppState);

  window.postMessage(
    {
      type: "STATE_UPDATE_REQUEST",
      payload: simplifiedState,
      source: window.location.origin,
    },
    window.location.origin,
  );
}

function observeAppComponentTree() {
  const simplifiedTree = extractSimpleData(window.AppComponentTree);

  window.postMessage(
    {
      type: "TREE_UPDATE_REQUEST",
      payload: simplifiedTree,
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
}, 1000);
