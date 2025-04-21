const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

let retries = 5;
const retryDelay = 1000;

function sendMessageWithRetry(message, retriesLeft) {
  if (chrome.runtime?.id) {
    chrome.runtime.sendMessage(message, (response) => {
      if (response && response.status === "OK") {
        console.log("Connection successful, sending message...");
        chrome.runtime.sendMessage({
          type: message.type,
          payload: message.payload,
          pigletSupport: message.pigletSupport,
        });
      } else if (retriesLeft > 0) {
        console.log(`Retrying... (${retriesLeft} attempts left)`);
        setTimeout(
          () => sendMessageWithRetry(message, retriesLeft - 1),
          retryDelay,
        );
      } else {
        console.error(
          "Failed to connect to background script after multiple retries.",
        );
      }
    });
  }
}

window.addEventListener(
  "message",
  function (event) {
    if (event.source !== window || !event.data) return;

    const { type, payload, pigletSupport } = event.data;

    if (
      type === "STATE_UPDATE_REQUEST" ||
      type === "TREE_UPDATE_REQUEST" ||
      type === "PIGLET_SUPPORT_UPDATE"
    ) {
      sendMessageWithRetry(
        {
          type,
          payload,
          pigletSupport,
        },
        retries,
      );
    }
  },
  false,
);
