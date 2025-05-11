/** @import {Config} from "@jsdocs/browser/config.d" */
import CONST from "@Piglet/browser/CONST";
import { buildComponentTree } from "@Piglet/browser/tree";

/** @type {Config} */
const config = {
  allowDebugging: true,

  enableCoreLogs: {
    info: false,
    warn: true,
    error: true,
  },

  AppRoot: undefined,

  componentCounter: 0,

  state: {},

  get tree() {
    if (this.AppRoot) {
      return buildComponentTree(this.AppRoot);
    }

    return {};
  },

  extension: {},

  mountedComponents: new Set(),

  componentsCount: {},

  component: {},

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
    this.state = {};
    this.componentCounter = 0;
  },

  __fetchCache: new Map(),

  __fetchQueue: new Map(),
};

export default config;
