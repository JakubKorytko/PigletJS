import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
// noinspection ES6UnusedImports
import { loadComponent } from "@Piglet/browser/loadComponent";
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
   *
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // noinspection JSIgnoredPromiseFromCall
    this.loadContent();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Reloads the component by resetting its internal state and re-fetching
   * the HTML content. It also re-runs the component's script.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the reload is complete.
   */
  async reloadComponent() {
    this._isHTMLInjected = false;
    this._isMounted = false;
    await this.runScript();
    await this.loadContent();
  }

  /**
   * Fetches and injects the HTML content for the component from the server.
   * The HTML is injected into the component's shadow DOM.
   *
   * @async
   * @returns {Promise<void|null>} A promise that resolves when the HTML content is loaded, or `null` in case of an error.
   */
  async loadContent() {
    const componentName = this.constructor.name;
    const url = `/component/html/${componentName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Failed to fetch HTML for ${componentName}`);
      }

      this.shadowRoot.innerHTML = await response.text();
      this._isHTMLInjected = true;
      this._mount();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Runs the JavaScript for the component by importing its associated script
   * and passing the host element to the `scriptRunner`.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the script has been executed.
   */
  async runScript() {
    scriptRunner(
      this.shadowRoot.host,
      await import(`/component/script/COMPONENT_NAME?noCache=${Date.now()}`),
    );
  }
}

// noinspection JSUnresolvedReference,JSUnusedGlobalSymbols
export default COMPONENT_NAME;
