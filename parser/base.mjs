import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import {
  assignIdToComponent,
  getHost,
  loadComponent,
} from "@Piglet/browser/helpers";
import scriptRunner from "@Piglet/browser/scriptRunner";

// noinspection JSClosureCompilerSyntax
/**
 * Represents a reactive web component that fetches and injects HTML content
 * and runs associated JavaScript. It extends the `ReactiveComponent` class.
 *
 * This component is responsible for loading its HTML content, running scripts,
 * and reacting to state changes. It also provides functionality to reload the component
 * and update its content.
 *
 * @class COMPONENT_CLASS_NAME
 * @extends ReactiveComponent
 */
class COMPONENT_CLASS_NAME extends ReactiveComponent {
  /**
   * Creates an instance of the component and attaches a shadow DOM.
   * It also loads the component's content via the `loadContent` method.
   *we
   * @constructor
   */
  constructor() {
    super();

    if (this.__isKilled) {
      this.remove();
      return;
    }

    this.attachShadow({ mode: "open" });

    assignIdToComponent(this);

    window.Piglet.component[this.__componentKey] = this;

    this.__isInFragment = this.isInDocumentFragmentDeep();

    const parent = getHost(this, true);
    if (parent instanceof ReactiveComponent && !parent.__ranScript) {
      parent.__waitingForScript.push(this);

      if (this.__isInFragment) {
        this.connectedCallback();
      }

      return;
    }

    this.loadContent(true);

    if (this.__isInFragment) {
      this.connectedCallback();
    }
  }

  /**
   * Runs the JavaScript for the component by importing its associated script
   * and passing the host element to the `scriptRunner`.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the script has been executed.
   */
  async runScript(reason) {
    scriptRunner(
      getHost(this),
      // we want to disable cache only if it was reloaded
      await import(
        `/component/script/COMPONENT_NAME${reason.name === "reload" ? `?noCache=${Date.now()}` : ""}`
      ),
      reason,
    );
  }
}

// Replaced with component name by parser
// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
// @ts-ignore
export default COMPONENT_NAME;
