import readline from "readline";
import fsp from "fs/promises";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import runApplication from "../watcher/spawn.mjs";
import CONST from "../misc/CONST.mjs";
import console from "../utils/console.mjs";

/**
 * Minifies the given code by removing comments and whitespace.
 *
 * @param {string} code - The code to minify.
 * @returns {string} The minified code.
 */
function safeMinify(code) {
  return code
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/\/\*\*[\s\S]*?\*\/|\/\*[^*][\s\S]*?\*\//g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[\r\n]{2,}/g, "\n")
    .trim();
}

/**
 * Minifies all MJS files in the given directory.
 *
 * @param {string} dir - The directory to minify.
 * @returns {Promise<void>}
 */
async function minifyMjsFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await minifyMjsFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      const content = await fsp.readFile(fullPath, "utf-8");
      const minified = safeMinify(content);
      await fsp.writeFile(fullPath, minified, "utf-8");
      console.log(`Minified: ${fullPath}`);
    }
  }
}

/**
 * Recursively copies all files and directories from a source directory to a destination directory.
 *
 * @param {string} srcDir - The source directory to copy from.
 * @param {string} destDir - The destination directory to copy to.
 * @returns {Promise<void>}
 */
async function copyRecursive(srcDir, destDir) {
  await fsp.mkdir(destDir, { recursive: true });
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      CONST.productionExclude.dirs.has(entry.name) ||
      CONST.productionExclude.files.has(entry.name)
    )
      continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Prepares the production build by removing the output directory, copying the project root,
 * minifying MJS files, removing production side-effects, and logging a message.
 *
 * @param {string} dirname - The base project directory.
 */
async function prepareProd(dirname) {
  const projectRoot = path.join(dirname, CONST.dirPath(false));
  const outputDir = path.join(dirname, CONST.dirPath(true));

  await fsp.rm(outputDir, { recursive: true, force: true });
  await copyRecursive(projectRoot, outputDir);
  console.log(`✅ ${CONST.dirPath(true)} created successfully.`);
  await minifyMjsFiles(outputDir);
  console.log("✅ Minification completed.");
  await fsp.rm(path.join(dirname, "start.mjs"));
  await fsp.rm(path.join(dirname, CONST.dirPath(true), "piglet.mjs"));
  console.log("✅ Removed production side-effects.");
  console.log("Run 'node piglet.mjs' to start the app!");
}

/**
 * Prompts the user with a yes/no question in the console.
 *
 * @param {string} question - The question to ask the user.
 * @returns {Promise<boolean>} Resolves to true if user answers "y", false otherwise.
 */
function askYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const yellow = "\x1b[33m";
    const reset = "\x1b[0m";
    const emoji = "💬 ";

    rl.question(`${yellow}${emoji}${question} (y/n): ${reset}`, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

/**
 * Prompts the user to select one of the provided choices.
 *
 * @param {string} question - The prompt question to display.
 * @param {string[]} choices - Array of string choices to display.
 * @returns {Promise<string>} The selected choice.
 */
function askChoice(question, choices) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";
  const emoji = "💬 ";
  const numberColor = "\x1b[36m"; // Cyan for numbers
  const selectColor = "\x1b[32m"; // Green for "Select"

  const formatted = choices
    .map((c, i) => `${numberColor}${i + 1})${reset} ${c}`)
    .join("\n");

  return new Promise((resolve) => {
    rl.question(
      `\n${yellow}${emoji}${question}${reset}\n${formatted}\n\n${selectColor}Select [1-${choices.length}]:${reset} `,
      (answer) => {
        rl.close();
        const index = parseInt(answer.trim(), 10) - 1;
        resolve(choices[index]);
      },
    );
  });
}

/**
 * Recursively copies all files and folders from a template directory to a target directory,
 * skipping files that already exist.
 *
 * @param {string} templateDir - Source directory containing the template files.
 * @param {string} targetDir - Target directory to copy files to.
 * @returns {Promise<void>}
 */
async function copyTemplateFiles(templateDir, targetDir) {
  const entries = await fsp.readdir(templateDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    const exists = fs.existsSync(destPath);
    if (exists) {
      console.msg("template.skipExistingFile", entry.name);
      continue;
    }

    if (entry.isDirectory()) {
      await fsp.mkdir(destPath, { recursive: true });
      await copyTemplateFiles(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
      console.msg("template.copiedFile", entry.name);
    }
  }
}

/**
 * Optionally applies a selected project template and sets up directory structure.
 *
 * @param {string} dirname - The base project directory.
 * @returns {Promise<void>}
 */
async function maybeUseTemplate(dirname) {
  const useTemplate = await askYesNo(CONST.consoleMessages.template.initialize);
  if (!useTemplate) return;

  const type = await askChoice(CONST.consoleMessages.template.whichTemplate, [
    CONST.consoleMessages.template.exampleApp,
    CONST.consoleMessages.template.structureOnly,
  ]);

  const selected = type.startsWith("⭐ Full") ? "exampleApp" : "structureOnly";
  const templatePath = path.join(dirname, "PigletJS", "templates", selected);

  console.nl();
  console.msg("template.applyingTemplate", selected);
  await copyTemplateFiles(templatePath, dirname);
  console.nl();

  if (selected === "structureOnly") {
    const foldersToCreate = [
      "src/components",
      "src/modules",
      "src/public",
      "server/api",
    ];

    for (const folder of foldersToCreate) {
      const fullPath = path.join(dirname, folder);
      if (!fs.existsSync(fullPath)) {
        await fsp.mkdir(fullPath, { recursive: true });
        console.msg("template.createdFolder", folder);
      } else {
        console.msg("template.existsFolder", folder);
      }
    }
  }
}

/**
 * Optionally copies a browser extension template if user confirms.
 *
 * @param {string} dirname - The base project directory.
 * @returns {Promise<void>}
 */
async function maybeCopyExtension(dirname) {
  console.nl();
  const includeExtension = await askYesNo(
    CONST.consoleMessages.template.doYouWantExtension,
  );
  console.nl();
  if (includeExtension) {
    const extensionSrc = path.join(dirname, "PigletJS", "extension");
    const extensionDest = path.join(dirname, "extension");

    if (fs.existsSync(extensionDest)) {
      console.msg("template.skipExtension");
    } else {
      console.msg("template.copyExtension");
      await fsp.mkdir(extensionDest, { recursive: true });
      await copyTemplateFiles(extensionSrc, extensionDest);
    }
    console.nl();
  }
}

/**
 * Runs a script to add the dev host to the system and starts the application.
 *
 * @param {string} dirname - The working directory in which to run the script.
 */
function runAddHostAndStartApp(dirname) {
  console.nl();
  console.msg("hosts.adding");

  const child = spawn("node", ["./PigletJS/builder/host.mjs"], {
    cwd: dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code === 0) {
      console.msg("hosts.addedToHosts");
    } else {
      console.msg("hosts.failedToAddHost");
    }
    runApplication(dirname);
  });
}

/**
 * Starts the Piglet app setup process, optionally clearing templates,
 * applying a template, copying extension files, and setting up host entries.
 *
 * @param {string} dirname - Project root directory.
 * @param {boolean} create - Whether to create a new project structure.
 * @param {boolean} host - Whether to only add a host entry.
 * @param {boolean} prod - Whether to generate production build
 * @returns {Promise<void>}
 */
async function start(dirname, create, host, prod) {
  if (prod) {
    await prepareProd(dirname);
    return;
  }

  if (create) {
    await maybeUseTemplate(dirname);
    await maybeCopyExtension(dirname);

    const shouldAddHost = await askYesNo(
      CONST.consoleMessages.hosts.doYouWantToAdd,
    );

    if (shouldAddHost) {
      runAddHostAndStartApp(dirname);
    } else {
      runApplication(dirname);
    }
  } else if (host) {
    runAddHostAndStartApp(dirname);
  } else {
    console.clear();
    await console.printPigAscii();
    runApplication(dirname);
  }
}

// noinspection JSUnusedGlobalSymbols
export default start;
