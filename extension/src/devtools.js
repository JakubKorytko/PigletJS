// noinspection JSUnresolvedReference

chrome.devtools.panels.create(
  "🐷 PigletJS",
  "assets/icon.png",
  "panel.html",
  function () {
    console.log("Components panel created.");
  },
);
