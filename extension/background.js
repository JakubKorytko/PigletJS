let lastState = null;
let lastTree = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case "STATE_UPDATE_REQUEST":
        if (JSON.stringify(lastState) !== JSON.stringify(message.payload)) {
          lastState = message.payload;
          chrome.runtime.sendMessage({
            type: "STATE_UPDATE",
            payload: lastState,
          });
        }
        sendResponse({ status: "OK" });
        break;

      case "TREE_UPDATE_REQUEST":
        if (JSON.stringify(lastTree) !== JSON.stringify(message.payload)) {
          lastTree = message.payload;
          chrome.runtime.sendMessage({
            type: "TREE_UPDATE",
            payload: lastTree,
          });
        }
        sendResponse({ status: "OK" });
        break;

      case "REQUEST_CURRENT_DATA":
        console.log("Sending current data", lastState, lastTree);
        sendResponse({
          type: "CURRENT_DATA",
          state: lastState,
          tree: lastTree,
        });
        break;

      case "PING":
        sendResponse({ status: "OK" });
        break;

      default:
        console.warn("Unknown message type received:", message.type);
        sendResponse({ status: "BAD_REQUEST", error: "Unknown message type" });
        break;
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ status: "BAD_REQUEST", error: error.message });
  }

  return true;
});
