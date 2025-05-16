import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent";
import scriptRunner from "@Piglet/browser/scriptRunner";
import {
  extractComponentTagsFromString,
  fetchComponentData,
  loadComponent,
} from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

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
   * @param {Reason} reason
   * @returns {Promise<void>}
   */
  async runScript(reason) {
    try {
      const { script } = await fetchComponentData(
        "COMPONENT_NAME",
        [CONST.componentRoute.script],
        CONST.reasonCache(reason),
      );
      if (!script) {
        return;
      }
      const tags = extractComponentTagsFromString(script.toString());
      await window.Piglet.AppRoot?.loadCustomComponents(tags);
      scriptRunner(this, script, reason);
    } catch (error) {
      window.Piglet.log(
        CONST.pigletLogs.errorLoadingScript,
        CONST.coreLogsLevels.warn,
        error,
      );
    }
  }
}

// Replaced with component name by parser
// noinspection JSUnresolvedReference
export default COMPONENT_NAME;
