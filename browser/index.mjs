import Piglet from "@Piglet/browser/config";
import { navigate } from "@Piglet/browser/helpers";
import { loadComponent } from "@Piglet/browser/loadComponent";

import AppRoot from "@Piglet/browser/classes/AppRoot";
import RenderIf from "@Piglet/browser/classes/RenderIf";
import Socket from "@Piglet/browser/socket";

async function loadCoreComponents() {
  await loadComponent(AppRoot);
  await loadComponent(RenderIf);
}

new Socket();

window.Piglet = Piglet;

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();

window["navigate"] ??= navigate;
