import CONST from "../CONST.mjs";

console.msg = function (path, ...args) {
  if (!path || typeof path !== "string") {
    console.msg("consoleMsg.invalidPath", path);
    return;
  }

  const keys = path.split(".");
  let current = CONST.consoleMessages;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      console.msg("consoleMsg.missingMessage", path);
      return;
    }
  }

  if (typeof current === "string") {
    console.log(current, ...args);
  } else if (typeof current === "function") {
    try {
      const result = current(...args);
      console.log(result);
    } catch (err) {
      console.msg("consoleMsg.evaluatingError", path, err);
    }
  } else {
    console.msg("consoleMsg.invalidMessageType", path);
  }
};
