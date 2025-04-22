// noinspection JSUnresolvedReference

const ports = new Set();

const sendToPorts = (type, payload) => {
  ports.forEach((port) => {
    port.postMessage({ type, payload, source: "PIGLET_BACKGROUND" });
  });
};

chrome.runtime.onConnect.addListener((port) => {
  ports.add(port);
  port.onMessage.addListener((msg) => {
    if (msg.type === "INITIAL_REQUEST") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id ?? msg.payload;
        chrome.tabs.sendMessage(tabId, {
          type: "INITIAL_REQUEST",
          source: "PIGLET_BACKGROUND",
        });
      });
    }

    if (msg.type === "MODIFY_STATE" && msg.payload) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id ?? msg.tabId;
        chrome.tabs.sendMessage(tabId, {
          type: "MODIFY_STATE",
          source: "PIGLET_BACKGROUND",
          payload: msg.payload,
        });
      });
    }
  });

  port.onDisconnect.addListener(() => ports.delete(port));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    const { type, payload, source } = message;

    if (source === "PIGLET_CONTENT") {
      sendToPorts(type, payload);
      sendResponse({ status: "OK", source: "PIGLET_BACKGROUND" });
    } else {
      console.warn("Unknown message type received:", message.type);
      sendResponse({
        status: "BAD_REQUEST",
        error: "Unknown message type",
        source: "PIGLET_BACKGROUND",
      });
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ status: "BAD_REQUEST", error: error.message });
  }

  return true;
});
