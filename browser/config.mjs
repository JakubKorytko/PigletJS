/** @import {Config} from "@jsdocs/browser/config.d" */
import CONST from "@Piglet/browser/CONST";

/** @type {Config} */
const config = {
  allowDebugging: true,

  enableCoreLogs: {
    info: false,
    warn: true,
    error: true,
  },

  componentCounter: 0,

  state: {},

  tree: {},

  extension: {},

  mountedComponents: new Set(),

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

  reset() {
    this.tree = {};
    this.state = {};
    this.componentCounter = 0;
  },
};

export default config;
