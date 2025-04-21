import CONST from "../CONST.mjs";
import fs from "fs/promises";
import path from "path";

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

console.choice = function (path, ...args) {
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";
  const emoji = "💬 ";

  const originalMsg = (...args) => {
    console.msg(path, ...args);
  };

  const wrapper = (...args) => {
    console.log(yellow + emoji + args.join(" ") + reset);
    originalMsg(...args);
  };

  wrapper(...args);
};

console.printPigAscii = async () => {
  try {
    const filePath = path.resolve(import.meta.dirname, "../pig_ascii.txt");
    const data = await fs.readFile(filePath, "utf8");

    const lines = data.split("\n");
    const maxWidth = Math.max(...lines.map((line) => line.length));

    const hotPink = "\x1b[38;5;213m";
    const reset = "\x1b[0m";

    console.log("\n\n" + hotPink + lines.join("\n") + reset);

    const label = "PigletJS";
    const padding = Math.floor((maxWidth - label.length) / 2);
    const centeredLabel = " ".repeat(Math.max(0, padding)) + label;

    console.log(hotPink + "\n" + centeredLabel + reset + "\n\n");
  } catch (err) {
    console.error("Failed to read pig_ascii.txt:", err.message);
  }
};
