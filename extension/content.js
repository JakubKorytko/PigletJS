const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

window.addEventListener(
  "message",
  function (event) {
    if (event.source !== window || event.data?.source !== "PIGLET_INJECTED")
      return;

    const { type, payload } = event.data;

    chrome.runtime.sendMessage({
      type,
      payload,
      source: "PIGLET_CONTENT",
    });
  },
  false,
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.source !== "PIGLET_BACKGROUND") return;

  if (msg.type === "INITIAL_REQUEST") {
    window.postMessage(
      {
        source: "PIGLET_CONTENT",
        type: "INITIAL_REQUEST",
      },
      "*",
    );
  }

  if (msg.type === "MODIFY_STATE") {
    window.postMessage(
      {
        source: "PIGLET_CONTENT",
        type: "MODIFY_STATE",
        payload: msg.payload,
      },
      "*",
    );
  }
});
