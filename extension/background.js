let lastState = null;
let lastTree = null;
let popupPort = null;

chrome.runtime.onConnect.addListener((port) => {
  console.log("Popup connected");

  popupPort = port;

  port.onMessage.addListener((message) => {
    console.log("Received message from popup:", message.type);

    if (message.type === "STATE_UPDATE") {
      if (JSON.stringify(lastState) !== JSON.stringify(message.payload)) {
        lastState = message.payload;
        try {
          if (popupPort && popupPort.postMessage) {
            popupPort.postMessage({
              type: "STATE_UPDATE",
              payload: lastState,
            });
          }
        } catch (error) {
          console.error("Error sending STATE_UPDATE:", error);
        }
      }
    }

    if (message.type === "TREE_UPDATE") {
      if (JSON.stringify(lastTree) !== JSON.stringify(message.payload)) {
        lastTree = message.payload;
        try {
          if (popupPort && popupPort.postMessage) {
            popupPort.postMessage({
              type: "TREE_UPDATE",
              payload: lastTree,
            });
          }
        } catch (error) {
          console.error("Error sending TREE_UPDATE:", error);
        }
      }
    }

    if (message.type === "REQUEST_CURRENT_DATA") {
      console.log("Sending current data to popup");
      try {
        if (popupPort && popupPort.postMessage) {
          popupPort.postMessage({
            type: "CURRENT_DATA",
            state: lastState,
            tree: lastTree,
          });
        }
      } catch (error) {
        console.error("Error sending CURRENT_DATA:", error);
      }
    }
  });

  port.onDisconnect.addListener(() => {
    console.log("Popup disconnected");
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from content script:", message);

  if (message.type === "PING") {
    sendResponse({ status: "OK" });
  }
  return true;
});
