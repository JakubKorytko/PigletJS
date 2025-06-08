// noinspection JSUnresolvedReference

import { updateDOM, attachMutationObserver } from "./src/helpers.mjs";

/** @type {import("./src/chrome.d.js").Chrome} */
const chromeExtension = globalThis.chrome;

let port;

document.addEventListener("DOMContentLoaded", () => {
  if (!port) port = chromeExtension.runtime.connect();

  attachMutationObserver(document.getElementById("state"));

  document.querySelectorAll(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".panel")
        .forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      if (tab instanceof HTMLButtonElement) {
        document.getElementById(tab.dataset.panel).classList.add("active");
      }
    }),
  );

  port.postMessage({
    type: "INITIAL_REQUEST",
    source: "PIGLET_PANEL",
    payload: chromeExtension.devtools?.inspectedWindow?.tabId,
  });

  port.onMessage.addListener((msg) => {
    if (msg.source === "PIGLET_BACKGROUND") {
      updateDOM(msg.type, msg.payload, port);
    }
  });

  setTimeout(() => {
    const loader = document.querySelector(".loader");
    const warning = document.querySelector("#warning");

    if (
      loader &&
      loader instanceof HTMLElement &&
      loader.offsetParent !== null
    ) {
      document.querySelectorAll(".loader").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = "none";
        }
      });

      if (warning && warning instanceof HTMLElement) {
        warning.style.display = "block";
      }
    }
  }, 6000);
});
