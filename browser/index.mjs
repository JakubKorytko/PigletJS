/** @import {Log} from "@jsdocs/browser/config.d" */

import Piglet from "@Piglet/browser/config";
import { loadComponent, pageRevealCallback } from "@Piglet/browser/helpers";

import * as Classes from "@Piglet/browser/classes/index";
import CONST from "@Piglet/browser/CONST";

const root = document.body.querySelector("app-root");
const config = document.querySelector('script[id="piglet-config"]');

let customConfig = {};

if (config) {
  try {
    customConfig = JSON.parse(config.textContent);
  } catch (error) {
    console.error("Failed to parse Piglet configuration:", error);
  }
}

if (!root) {
  console.error(
    "No <app-root> element found in the document. Stopping execution.",
  );
  window.stop();
  throw new Error("No <app-root> element found.");
}

window.addEventListener("pagereveal", pageRevealCallback.bind(root, root));

const coreComponents = [
  Classes.AppRoot,
  Classes.RenderIf,
  Classes.NavLink,
  Classes.KinderGarten,
  Classes.AppContent,
];

async function loadCoreComponents() {
  for (const component of coreComponents) {
    await loadComponent(component);
  }
}

new Classes.Socket(root);

root.config = {
  ...Piglet,
  ...customConfig,
};

/** @type {Log} */
window.console.pig = function (
  message,
  severity = CONST.coreLogsLevels.info,
  ...args
) {
  if (!root.config.enableCoreLogs[severity]) return;

  if (!Object.values(CONST.coreLogsLevels).includes(severity)) {
    severity = CONST.coreLogsLevels.info;
  }

  console[
    severity === CONST.coreLogsLevels.info
      ? CONST.coreLogLevelsAliases.info
      : severity
  ](message, ...args);
};

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();
