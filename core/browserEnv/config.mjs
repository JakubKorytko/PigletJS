export default {
  allowDebugging: true,
  enableCoreLogs: {
    info: false,
    warn: true,
    error: true,
  },
  componentCounter: 0,
  state: {},
  tree: {},
  log(message, severity = "info", ...args) {
    if (!this.enableCoreLogs[severity]) return;
    const levels = ["info", "warn", "error"];

    if (!levels.includes(severity)) {
      severity = "info";
    }

    if (severity === "info") severity = "log";

    console[severity](message, ...args);
  },
  reset() {
    this.tree = {};
    this.state = {};
    this.componentCounter = 0;
  },
};
