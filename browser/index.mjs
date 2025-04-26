import Piglet from "@Piglet/browser/config";
import { navigate } from "@Piglet/browser/helpers";
import { loadComponent } from "@Piglet/browser/loadComponent";

import AppRoot from "@Piglet/browser/classes/AppRoot";
import RenderIf from "@Piglet/browser/classes/RenderIf";

async function loadCoreComponents() {
  await loadComponent(AppRoot);
  await loadComponent(RenderIf);
}

const ws = new WebSocket("ws://" + location.host);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "reload" && message.data) {
    /* Reload here */
  }
};

window.Piglet = Piglet;

// noinspection JSIgnoredPromiseFromCall
loadCoreComponents();

window["navigate"] ??= navigate;
