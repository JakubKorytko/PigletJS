import Piglet from "@Piglet/browser/config";

import { navigate } from "@Piglet/browser/helpers";
import { injectTreeTrackingToComponentClass } from "@Piglet/browser/tree";

import AppRoot from "@Piglet/browser/classes/AppRoot";
import RenderIf from "@Piglet/browser/classes/RenderIf";

const ws = new WebSocket("ws://" + location.host);

ws.onmessage = (event) => {
  if (event.data === "reload") {
    location.reload();
  }
};

window.Piglet = Piglet;

injectTreeTrackingToComponentClass(RenderIf);
injectTreeTrackingToComponentClass(AppRoot);

customElements.define("render-if", RenderIf);
customElements.define("app-root", AppRoot);

window["navigate"] ??= navigate;
