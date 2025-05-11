import Piglet from "@Piglet/browser/config";
import {
  navigate,
  loadComponent,
  fetchWithCache,
} from "@Piglet/browser/helpers";

import AppRoot from "@Piglet/browser/classes/AppRoot";
import RenderIf from "@Piglet/browser/classes/RenderIf";
import Socket from "@Piglet/browser/classes/Socket";

async function loadCoreComponents() {
  await loadComponent(AppRoot);
  await loadComponent(RenderIf);
}

new Socket();

window.fetchWithCache = fetchWithCache;
window.Piglet = Piglet;

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();

window.$navigate ??= navigate;
