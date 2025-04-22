import "@Piglet/browserEnv/root";
import "@Piglet/browserEnv/reactiveComponent";
import "@Piglet/browserEnv/treeTracking";
import { navigate } from "@Piglet/browserEnv/helpers";
import { injectTreeTrackingToComponentClass } from "@Piglet/browserEnv/treeTracking";
import CIf from "@Piglet/browserEnv/cif";

injectTreeTrackingToComponentClass(CIf);
customElements.define("c-if", CIf);

window["navigate"] ??= navigate;
