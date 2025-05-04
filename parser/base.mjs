import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import { getHost, loadComponent } from "@Piglet/browser/helpers";
// noinspection ES6UnusedImports
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
    this.attachShadow({ mode: "open" });
    // noinspection JSIgnoredPromiseFromCall
    this.loadContent();
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
      await import(`/component/script/COMPONENT_NAME?noCache=${Date.now()}`),
      reason,
    );
  }
}

// Replaced with component name by parser
// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
// @ts-ignore
export default COMPONENT_NAME;
