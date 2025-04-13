let lastAppState = null;
let lastAppComponentTree = null;

function observeAppState() {
  if (window.AppState !== lastAppState) {
    lastAppState = window.AppState;

    const simplifiedState = extractSimpleData(window.AppState);

    window.postMessage(
      {
        type: "STATE_UPDATE",
        payload: simplifiedState,
      },
      window.location.origin,
    );
  }
}

function observeAppComponentTree() {
  if (window.AppComponentTree !== lastAppComponentTree) {
    lastAppComponentTree = window.AppComponentTree;

    const simplifiedTree = extractSimpleData(window.AppComponentTree);

    window.postMessage(
      {
        type: "TREE_UPDATE",
        payload: simplifiedTree,
      },
      window.location.origin,
    );
  }
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
