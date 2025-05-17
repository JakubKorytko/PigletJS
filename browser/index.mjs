import Piglet from "@Piglet/browser/config";
import {
  navigate,
  loadComponent,
  fetchWithCache,
  $create,
  api,
} from "@Piglet/browser/helpers";

import AppRoot from "@Piglet/browser/classes/AppRoot";
import RenderIf from "@Piglet/browser/classes/RenderIf";
import Socket from "@Piglet/browser/classes/Socket";
import NavLink from "@Piglet/browser/classes/NavLink";

async function loadCoreComponents() {
  await loadComponent(AppRoot);
  await loadComponent(RenderIf);
  await loadComponent(NavLink);
}

new Socket();

window.fetchWithCache = fetchWithCache;
window.Piglet = Piglet;
window.$ = $create;
window.$api = api;

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();

window.$navigate ??= navigate;
