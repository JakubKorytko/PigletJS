import console from "../utils/console.mjs";
import path from "path";
import fs from "fs/promises";
import CONST from "../misc/CONST.mjs";

const { consoleCodes: CONSOLE_CODES, wizardSteps } = CONST;
const { colors: COLORS, bgColors: BG_COLORS } = CONSOLE_CODES;
const previousRenders = [];

/**
 * @typedef {{
 *      [key: string]: string[] | string;
 * }} Answers
 */

/**
 * @typedef {Object} WizardStep
 * @property {string} name - The name of the step.
 * @property {string} type - The type of the step ('single' or 'checkbox').
 * @property {string} prompt - The prompt message for the step.
 * @property {Array<string|{label: string, description?: string, checked?: boolean}>} options - The options for the step.
 */

/**
 * @typedef {
 * {
 *     wizardResult: string;
 *     answers: Answers;
 * } | { aborted: true }
 * } WizardResult
 */

/**
 * @typedef {
 * {
 *     host: boolean;
 *     template: "exampleApp" | "structureOnly" | "none";
 *     extension: boolean;
 *     files: string[];
 *     preLog: string;
 * } | { aborted: true }
 * } SetupResult
 */

/**
 * Applies color styles to the given text.
 *
 * @param {string} text - The text to style.
 * @param {...string} styles - The styles to apply.
 * @returns {string} The styled text.
 */
function color(text, ...styles) {
  return styles.join("") + text + CONSOLE_CODES.colorReset;
}

/**
 * Renders a summary of the user's choices.
 *
 * @param {Answers} summary - The summary object containing the user's choices.
 * @returns {string} The rendered summary.
 */
function renderSummary(summary) {
  if (summary && Object.entries(summary).length) {
    console.mLog(
      "summary",
      color("🧾 Your choices:\n", COLORS.bold, COLORS.orange),
    );
    for (const [key, value] of Object.entries(summary)) {
      const val = Array.isArray(value) ? value.join(", ") : value;
      console.mLog("summary", `- ${key}: ${val}`);
    }
  }

  return console.popLog("summary");
}

/**
 * Displays a checkbox menu for the user to select multiple options.
 *
 * @param {string} header - The header text for the menu.
 * @param {Array<string|{label: string, description?: string, checked?: boolean}>} options - The options to display.
 * @returns {Promise<Array<string>|null>} A promise that resolves with the selected options or null if aborted.
 */
function checkboxMenu(header, options) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    if (process.stdin.isTTY) stdin.setRawMode(true);
    stdin.setEncoding("utf8");

    const normalizedOptions = options.map((opt) =>
      typeof opt === "string"
        ? { label: opt, description: "", checked: false }
        : {
            label: opt.label,
            description: opt.description || "",
            checked: !!opt.checked,
          },
    );

    const checked = normalizedOptions.map((opt) => opt.checked);
    let selected = 0;

    function color(text, ...styles) {
      return styles.join("") + text + CONSOLE_CODES.colorReset;
    }

    function render() {
      console.cls("hide");
      for (const rnd of previousRenders) {
        console.log(rnd);
      }
      console.popLog("checkBox");
      console.mLog(
        "checkBox",
        color(header, COLORS.bold, COLORS.orange) + "\n",
      );
      normalizedOptions.forEach((opt, i) => {
        const cursor = i === selected ? color(">", COLORS.yellow) : " ";
        const box = checked[i] ? color("[x]", COLORS.orange) : "[ ]";
        const label =
          i === selected ? color(opt.label, COLORS.bold) : opt.label;
        console.mLog("checkBox", `${cursor} ${box} ${label}`);
        if (opt.description) {
          console.mLog("checkBox", `   ${color(opt.description, COLORS.gray)}`);
        }
      });

      const ok =
        selected === normalizedOptions.length
          ? color(" OK ", BG_COLORS.orange, COLORS.black)
          : " OK ";
      const cancel =
        selected === normalizedOptions.length + 1
          ? color(" Cancel ", BG_COLORS.orange, COLORS.black)
          : " Cancel ";
      console.log(`\n   ${ok}   ${cancel}`);
    }

    function exitAndResolve(result) {
      if (process.stdin.isTTY) stdin.setRawMode(false);
      stdin.removeAllListeners("data");
      console.cls("show");
      previousRenders.push(console.popLog("checkBox"));
      resolve(result);
    }

    function handleKey(key) {
      if (key === CONSOLE_CODES.ctrlC || key === CONSOLE_CODES.esc)
        return exitAndResolve(null);

      switch (key) {
        case CONSOLE_CODES.arrowUp:
          if (selected > 0 && selected < normalizedOptions.length) selected--;
          else if (selected >= normalizedOptions.length)
            selected = normalizedOptions.length - 1;
          break;

        case CONSOLE_CODES.arrowDown:
          if (selected < normalizedOptions.length - 1) {
            selected++;
          } else if (selected === normalizedOptions.length - 1) {
            selected = normalizedOptions.length;
          }
          break;

        case CONSOLE_CODES.arrowRight:
          if (selected === normalizedOptions.length)
            selected = normalizedOptions.length + 1;
          break;

        case CONSOLE_CODES.arrowLeft:
          if (selected === normalizedOptions.length + 1)
            selected = normalizedOptions.length;
          break;

        case " ":
        case "\r":
          if (selected < normalizedOptions.length) {
            checked[selected] = !checked[selected];
          } else if (selected === normalizedOptions.length) {
            const result = normalizedOptions
              .map((opt, i) => (checked[i] ? opt.label : null))
              .filter(Boolean);
            return exitAndResolve(result);
          } else if (selected === normalizedOptions.length + 1) {
            return exitAndResolve(null);
          }
          break;
      }

      render();
    }

    stdin.on("data", handleKey);
    render();
  });
}

/**
 * Displays a single-option selection menu.
 *
 * @param {string} header - The header text for the menu.
 * @param {Array<string|{label: string}>} options - The options to display.
 * @returns {Promise<string|null>} A promise that resolves with the selected option or null if aborted.
 */
function selectSingleOption(header, options) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    if (process.stdin.isTTY) stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdout.write(CONSOLE_CODES.hideCursor);

    const normalizedOptions = options.map((opt) =>
      typeof opt === "string" ? { label: opt } : opt,
    );

    let selected = 0;

    function render() {
      console.cls("hide");
      for (const rnd of previousRenders) {
        console.log(rnd);
      }
      console.popLog("single");
      console.mLog("single", color(header, COLORS.bold, COLORS.orange) + "\n");
      const display = normalizedOptions.map((opt, i) => {
        const text = ` ${opt.label} `;
        return i === selected
          ? color(`[${text}]`, BG_COLORS.orange, COLORS.black)
          : `[${text}]`;
      });
      console.mLog("single", display.join(" / "));
    }

    function exitAndResolve(result) {
      if (process.stdin.isTTY) stdin.setRawMode(false);
      stdin.removeAllListeners("data");
      console.cls("show");
      previousRenders.push(console.popLog("single"));
      resolve(result);
    }

    function handleKey(key) {
      if (key === CONSOLE_CODES.ctrlC || key === CONSOLE_CODES.esc)
        return exitAndResolve(null);

      switch (key) {
        case CONSOLE_CODES.arrowRight:
          selected = (selected + 1) % normalizedOptions.length;
          break;
        case CONSOLE_CODES.arrowLeft:
          selected =
            (selected - 1 + normalizedOptions.length) %
            normalizedOptions.length;
          break;
        case " ":
        case "\r":
          return exitAndResolve(normalizedOptions[selected].label);
      }
      render();
    }

    stdin.on("data", handleKey);
    render();
  });
}

/**
 * Runs the wizard with the given steps.
 *
 * @param {WizardStep[]} steps - The steps to execute in the wizard.
 * @returns {Promise<WizardResult>} The result of the wizard.
 */
async function runWizard(steps) {
  console.cls();
  const answers = {};
  const filePath = path.resolve(import.meta.dirname, "../misc/pig_ascii.txt");
  const pigletAscii = await fs.readFile(filePath, "utf8");
  previousRenders.push(console.printPigAsciiSync(pigletAscii));

  for (const step of steps) {
    const result =
      step.type === "single"
        ? await selectSingleOption(step.prompt, step.options)
        : await checkboxMenu(step.prompt, step.options);

    if (result === null) return { aborted: true };
    answers[step.name] = result;
  }

  console.cls();
  let wizardResult = "";

  for (const rnd of previousRenders) {
    console.log(rnd);
    wizardResult += rnd + "\n";
  }
  wizardResult += renderSummary(answers);

  return { wizardResult, answers, aborted: false };
}

/**
 * Runs the setup process by executing the wizard and processing the results.
 *
 * @returns {Promise<SetupResult>} The result of the setup process.
 */
async function runSetup() {
  const { answers, wizardResult, aborted } = await runWizard(wizardSteps);

  if (aborted) return { aborted: true };

  let template = "none";

  if (answers?.template === "Showcase example app") {
    template = "exampleApp";
  }

  if (answers?.template === "Directories structure only") {
    template = "structureOnly";
  }

  return {
    host: answers?.additional.includes("Add piglet.js to hosts file"),
    template,
    extension: answers?.additional.includes("Copy extension to project root"),
    files: answers?.files,
    preLog: wizardResult,
  };
}

export default runSetup;
