// noinspection JSUnresolvedReference

/** @type {import("./chrome.d.js").Chrome} */
const chromeExtension = globalThis.chrome;

chromeExtension.devtools.panels.create(
  "🐷 PigletJS",
  "assets/icon.png",
  "panel.html",
  function () {
    console.log("Components panel created.");
  },
);
