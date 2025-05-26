import Piglet from "@Piglet/browser/config";
import {
  navigate,
  loadComponent,
  fetchWithCache,
  api,
  pageRevealCallback,
} from "@Piglet/browser/helpers";

import * as Classes from "@Piglet/browser/classes/index";

window.addEventListener("pagereveal", pageRevealCallback);

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

new Classes.Socket();

window.fetchWithCache = fetchWithCache;
window.Piglet = Piglet;
window.$api = api;

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();

window.$navigate ??= navigate;
