// noinspection JSUnusedLocalSymbols,JSUnusedAssignment,JSUnresolvedReference,JSUnusedGlobalSymbols,ThisExpressionReferencesGlobalObjectJS,JSFileReferences,ES6UnusedImports

import ReactiveComponent from "/Piglet/classes/ReactiveComponent";
import { loadComponent } from "/Piglet/loadComponent";
import scriptRunner from "/Piglet/scriptRunner";

class COMPONENT_CLASS_NAME extends ReactiveComponent {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.loadContent().then((content) => {
      const componentKey = `${this.constructor.name}${this.__componentId ?? window.Piglet.componentCounter + 1}`;
      shadow.innerHTML = content;
      this._isHTMLInjected = true;
      this._mount();
    });
  }

  async loadContent() {
    const componentName = this.constructor.name;
    const url = `/component/html/${componentName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch HTML for ${componentName}`);
      }
      return await response.text();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  runScript(shadowRoot) {
    (function (shadowRoot, hostElement) {
      import(`/component/script/COMPONENT_NAME`).then((module) =>
        scriptRunner(hostElement, module),
      );
    })(shadowRoot, this);
  }
}

export default COMPONENT_NAME;
