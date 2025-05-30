import CONST from "../misc/CONST.mjs";
import fs from "fs/promises";
import path from "path";

/**
 * @typedef ExtendedConsole
 * @property {function(string, ...any): void} msg
 * @property {function(): void} nl
 * @property {function(string, ...any): void} choice
 * @property {function(): Promise<void>} printPigAscii
 */

/** @type {Console & Partial<ExtendedConsole>} */
const console = global.console ?? window.console;

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

  let log = console.log;

  let column = 3; // Default column

  if (path === "components.generated") {
    column = 1;
  } else if (path === "components.watchingForChanges") {
    column = 0;
  }

  if (global.server) {
    log = global.server.pushToColumn.bind(global.server, column);
  }

  if (typeof current === "string") {
    log(current, ...args);
  } else if (typeof current === "function") {
    try {
      const result = current(...args);
      log(result);
    } catch (err) {
      console.msg("consoleMsg.evaluatingError", path, err);
    }
  } else {
    console.msg("consoleMsg.invalidMessageType", path);
  }
};

/**
 * Prints a pig ASCII art with styling and returns the formatted output.
 * This is a synchronous version of the `printPigAscii` function.
 *
 * @param {string} data - The ASCII art string content
 * @returns {string} - The formatted ASCII art that was printed
 */
console.printPigAsciiSync = (data) => {
  const lines = data.split("\n");
  const maxWidth = Math.max(...lines.map((line) => line.length));

  const hotOrange = CONST.consoleCodes.colors.orange;
  const reset = CONST.consoleCodes.colorReset;

  console.mLog("pigAscii", "\n\n" + hotOrange + lines.join("\n") + reset);

  const label = "PigletJS";
  const padding = Math.floor((maxWidth - label.length) / 2);
  const centeredLabel = " ".repeat(Math.max(0, padding)) + label;

  console.mLog("pigAscii", hotOrange + "\n" + centeredLabel + reset + "\n\n");
  return console.popLog("pigAscii");
};

/**
 * Asynchronously reads and prints the PigletJS ASCII art from a file.
 * Uses the synchronous version `printPigAsciiSync` to display the content.
 *
 * @returns {Promise<void>}
 */
console.printPigAscii = async () => {
  try {
    const filePath = path.resolve(import.meta.dirname, "../misc/pig_ascii.txt");
    const data = await fs.readFile(filePath, "utf8");
    console.printPigAsciiSync(data);
  } catch (err) {
    console.error("Failed to read pig_ascii.txt:", err.message);
  }
};

/**
 * Logs a message to the console and stores it in memory under a label.
 *
 * @param {string} label - The identifier to store the log message under
 * @param {...any} args - The message parts to be logged
 */
console.mLog = function (label, ...args) {
  this.memory ??= {};
  this.memory[label] ??= "";
  this.memory[label] += args.join(" ") + "\n";
  console.log(...args);
};

/**
 * Retrieves a log from memory and removes it without displaying.
 *
 * @param {string} label - The identifier of the log to retrieve
 * @returns {string} The log content or an empty string if not found
 */
console.popLog = function (label) {
  if (this.memory && this.memory[label]) {
    const log = this.memory[label];
    delete this.memory[label];
    return log;
  }
  return "";
};

/**
 * Clears the console and optionally shows or hides the cursor.
 *
 * @param {string} [cursor=""] - Controls cursor visibility: "show", "hide", or "" (no change)
 */
console.cls = function (cursor = "") {
  console.clear();
  process.stdout.write(CONST.consoleCodes.clearScreen);
  if (cursor === "show") {
    process.stdout.write(CONST.consoleCodes.showCursor);
  } else if (cursor === "hide") {
    process.stdout.write(CONST.consoleCodes.hideCursor);
  }
};

/**
 * Hides the terminal cursor.
 */
console.hideCursor = function () {
  process.stdout.write(CONST.consoleCodes.hideCursor);
};

/**
 * Shows the terminal cursor.
 */
console.showCursor = function () {
  process.stdout.write(CONST.consoleCodes.showCursor);
};

export default console;
