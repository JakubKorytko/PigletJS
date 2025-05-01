import CONST from "@Piglet/browser/CONST";

/**
 * Core configuration object for debugging, logging, state management,
 * and component tracking within the application.
 * @namespace PigletConfig
 */
export default {
  /**
   * Enables or disables application-wide debugging features.
   * @type {boolean}
   */
  allowDebugging: true,

  /**
   * Controls which core log levels are enabled.
   * Only logs with enabled levels will be output.
   * @type {{ info: boolean, warn: boolean, error: boolean }}
   */
  enableCoreLogs: {
    info: false,
    warn: true,
    error: true,
  },

  /**
   * A counter used to track and generate unique component identifiers.
   * @type {number}
   */
  componentCounter: 0,

  /**
   * Holds the internal application state.
   * @type {Object}
   */
  state: {},

  /**
   * Represents the structure of the component tree.
   * @type {Object}
   */
  tree: {},

  /**
   * The `Piglet.extension` object provides methods to communicate the current
   * application state and component tree to external tools, such as browser extensions.
   * These methods are used for debugging and visualization purposes.
   *
   * @namespace Piglet.extension
   * @property {Function=} sendInitialData - Sends both the transformed component state and the simplified component tree
   * to the parent window. This is typically used when the extension is first loaded
   * or when the user manually requests the data.
   *
   * @property {Function=} sendTreeUpdate - Sends the current, simplified component tree to the parent window.
   * Useful for updating a visual tree view in real-time.
   *
   * @property {Function=} sendStateUpdate - Sends the current, transformed and simplified component state to the parent window.
   * Useful for synchronizing state panels or external tools.
   */
  extension: {},

  /**
   * A set containing references to all currently mounted components
   * within the application.
   *
   * Each entry in the set typically represents a live custom element instance
   * that has been attached to the DOM and is being tracked for features like
   * hot-reloading, debugging, or state synchronization.
   *
   * @type {Set<HTMLElement>}
   */
  mountedComponents: new Set(),

  /**
   * Logs a message to the console based on severity, if the corresponding
   * log level is enabled in `enableCoreLogs`.
   *
   * @param {string} message - The main log message.
   * @param {"info"|"warn"|"error"} [severity="info"] - The severity level of the log.
   * @param {...any} args - Additional values to be logged with the message.
   */
  log(message, severity = CONST.coreLogsLevels.info, ...args) {
    if (!this.enableCoreLogs[severity]) return;

    if (!Object.values(CONST.coreLogsLevels).includes(severity)) {
      severity = CONST.coreLogsLevels.info;
    }

    console[
      severity === CONST.coreLogsLevels.info
        ? CONST.coreLogLevelsAliases.info
        : severity
    ](message, ...args);
  },

  /**
   * Resets the internal component tree, state object, and component counter
   * to their initial default values.
   * @returns {void}
   */
  reset() {
    this.tree = {};
    this.state = {};
    this.componentCounter = 0;
  },
};
