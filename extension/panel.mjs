import { updateDOM } from "./src/helpers.mjs";

let port;

document.addEventListener("DOMContentLoaded", () => {
  if (!port) port = chrome.runtime.connect();

  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.panel).classList.add("active");
    }),
  );

  port.postMessage({
    type: "INITIAL_REQUEST",
    source: "PIGLET_PANEL",
    payload: chrome.devtools?.inspectedWindow?.tabId,
  });

  port.onMessage.addListener((msg) => {
    if (msg.source === "PIGLET_BACKGROUND") {
      updateDOM(msg.type, msg.payload, port);
    }
  });

  setTimeout(() => {
    const loader = document.querySelector(".loader");
    const warning = document.querySelector("#warning");

    if (loader && loader.offsetParent !== null) {
      document.querySelectorAll(".loader").forEach((el) => {
        el.style.display = "none";
      });

      if (warning) {
        warning.style.display = "block";
      }
    }
  }, 6000);
});
