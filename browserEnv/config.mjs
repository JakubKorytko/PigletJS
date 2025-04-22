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
   * Logs a message to the console based on severity, if the corresponding
   * log level is enabled in `enableCoreLogs`.
   *
   * @param {string} message - The main log message.
   * @param {"info"|"warn"|"error"} [severity="info"] - The severity level of the log.
   * @param {...any} args - Additional values to be logged with the message.
   */
  log(message, severity = "info", ...args) {
    if (!this.enableCoreLogs[severity]) return;
    const levels = ["info", "warn", "error"];

    if (!levels.includes(severity)) {
      severity = "info";
    }

    console[severity === "info" ? "log" : severity](message, ...args);
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
