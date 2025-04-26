// noinspection JSUnusedLocalSymbols,JSUnusedAssignment,JSUnresolvedReference,JSUnusedGlobalSymbols,ThisExpressionReferencesGlobalObjectJS,JSFileReferences,ES6UnusedImports

import ReactiveComponent from "/Piglet/classes/reactiveComponent";
import { injectTreeTrackingToComponentClass } from "/Piglet/tree";
import { getComponentDataMethod, api } from "/Piglet/helpers";
/* ADDITIONAL IMPORTS */

class COMPONENT_CLASS_NAME extends ReactiveComponent {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = COMPONENT_INNER_HTML;
    const componentKey = `${this.constructor.name}${this.__componentId ?? window.Piglet.componentCounter + 1}`;

    /* ADDITIONAL CONSTRUCTOR STEPS */
  }

  /* RUN SCRIPT HERE */
}

injectTreeTrackingToComponentClass(COMPONENT_CLASS_NAME);
customElements.define("TAG_NAME", COMPONENT_CLASS_NAME);
export default COMPONENT_NAME;
