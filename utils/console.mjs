import CONST from "../misc/CONST.mjs";
import fs from "fs/promises";
import path from "path";

/**
 * Custom message logging function that fetches messages from `CONST.consoleMessages`
 * and logs them to the console.
 *
 * The message path is a string in dot notation (e.g., `consoleMessages.error.fileNotFound`).
 * If the message exists, it will be logged to the console. If the message is a function,
 * it will be executed and the result will be logged.
 *
 * @param {string} path - The path to the console message in dot notation (e.g., `consoleMessages.error.fileNotFound`).
 * @param {...any} args - Additional arguments to be passed to the message or function.
 */
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
      // noinspection JSValidateTypes
      const result = current(...args);
      console.log(result);
    } catch (err) {
      console.msg("consoleMsg.evaluatingError", path, err);
    }
  } else {
    console.msg("consoleMsg.invalidMessageType", path);
  }
};

console.nl = () => console.log("");

/**
 * Custom logging function with emoji and colored output that calls `console.msg`.
 *
 * This function logs a message with a yellow emoji and resets color formatting.
 * It wraps around the `console.msg` function to provide a more colorful output.
 *
 * @param {string} path - The path to the console message in dot notation (e.g., `consoleMessages.error.fileNotFound`).
 * @param {...any} args - Additional arguments to be passed to the message or function.
 */
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

/**
 * Reads the ASCII art from a file and prints it to the console with custom styling.
 *
 * This function reads the contents of `pig_ascii.txt`, which is expected to contain
 * ASCII art. It prints the art to the console with hot pink coloring, followed by
 * the "PigletJS" label centered below it.
 *
 * @returns {Promise<void>} Resolves when the ASCII art is successfully printed, or rejects on error.
 */
console.printPigAscii = async () => {
  try {
    const filePath = path.resolve(import.meta.dirname, "../misc/pig_ascii.txt");
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
