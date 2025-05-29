/** @import {Logger} from "./stackedLogger.mjs" */

import fsp from "fs/promises";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import CONST from "../misc/CONST.mjs";
import console from "../utils/console.mjs";
import runSetup from "./wizard.mjs";
import { createStackedLogger } from "./stackedLogger.mjs";

const CURRENT_DIR = process.cwd();

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
 * @param {Logger['log']} logger - Optional logger function to log messages.
 * @returns {Promise<void>}
 */
async function minifyMjsFiles(dir, logger) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await minifyMjsFiles(fullPath, logger);
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      const content = await fsp.readFile(fullPath, "utf-8");
      const minified = safeMinify(content);
      await fsp.writeFile(fullPath, minified, "utf-8");
      logger("minify", entry.name);
    }
  }
}

/**
 * Checks if a file exists at the given path.
 *
 * @param {string} filepath The path to the file to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the file exists, `false` otherwise.
 */
async function fileExists(filepath) {
  try {
    await fsp.access(filepath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively copies all files and directories from a source directory to a destination directory,
 * excluding specified paths.
 *
 * @param {string} srcDir - The source directory to copy from.
 * @param {string} destDir - The destination directory to copy to.
 * @param {string[]} [excludedPaths=[]] - Array of paths to exclude.
 * @param {Logger['log']} logger - Optional logger function to log messages.
 * @returns {Promise<void>}
 */
async function copyRecursive(srcDir, destDir, excludedPaths = [], logger) {
  await fsp.mkdir(destDir, { recursive: true });
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (
      excludedPaths.some((excluded) => srcPath.includes(excluded)) ||
      CONST.productionExclude.dirs.has(entry.name) ||
      CONST.productionExclude.files.has(entry.name)
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, excludedPaths, logger);
    } else {
      await fsp.copyFile(srcPath, destPath);
      logger("copy", entry.name);
    }
  }
}

/**
 * Prepares the production build by removing the output directory, copying the project root,
 * minifying MJS files, removing production side-effects, and logging a message.
 *
 * @param {string} pigletPath - The PigletJS directory path.
 * @param {string} targetDir - The target directory where the production build will be created.
 * @param {Logger['log']} logger - Optional logger function to log messages.
 */
async function prepareProd(pigletPath, targetDir, logger) {
  const outputDir = path.join(targetDir, CONST.dirPath(true));

  await fsp.rm(outputDir, { recursive: true, force: true });
  await copyRecursive(
    pigletPath,
    outputDir,
    [
      path.join("builder", "wizard.mjs"),
      path.join("builder", "index.mjs"),
      path.join("builder", "app_jsconfig.json"),
      path.join("builder", "host.mjs"),
    ],
    logger,
  );
  await minifyMjsFiles(outputDir, logger);
  if (fs.existsSync(path.join(targetDir, "start.mjs")))
    await fsp.rm(path.join(targetDir, "start.mjs"));
  if (fs.existsSync(path.join(outputDir, "piglet.mjs")))
    await fsp.rm(path.join(outputDir, "piglet.mjs"));
}

/**
 * Copies a file from `src` to `dest` if the destination does not already exist.
 *
 * @param {string} src The source file path.
 * @param {string} dest The destination file path.
 * @param {Logger['log']} logger Optional logger function to log messages.
 * @returns {Promise<void>} A promise that resolves when the file is copied, or skips if the file exists.
 */
async function copyFileSafe(src, dest, logger) {
  const exists = await fileExists(dest);
  if (exists) {
    logger("skip", path.basename(dest));
    return;
  }
  await fsp.copyFile(src, dest);
  logger("copy", path.basename(dest));
}

/**
 * Recursively copies all files and folders from a template directory to a target directory,
 * skipping files that already exist.
 *
 * @param {string} pigletDir - Source directory containing the template files.
 * @param {string} targetDir - Target directory to copy files to.
 * @param {Logger['log']} logger - Optional logger function to log messages.
 * @returns {Promise<void>}
 */
async function copyTemplateFiles(pigletDir, targetDir, logger) {
  const entries = await fsp.readdir(pigletDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(pigletDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    const exists = fs.existsSync(destPath);
    if (exists) {
      logger("skip", entry.name);
      continue;
    }

    if (entry.isDirectory()) {
      await fsp.mkdir(destPath, { recursive: true });
      await copyTemplateFiles(srcPath, destPath, logger);
    } else {
      await fsp.copyFile(srcPath, destPath);
      logger("copy", entry.name);
    }
  }
}

/**
 * Optionally applies a selected project template and sets up directory structure.
 *
 * @param {string} pigletDir - The PigletJS directory containing the templates.
 * @param {string} targetDir - The target directory where the template should be applied.
 * @param {string} template - The template to apply (e.g., "exampleApp" or "structureOnly").
 * @param {Logger['log']} logger - Optional logger function to log messages.
 * @returns {Promise<void>}
 */
async function maybeUseTemplate(pigletDir, targetDir, template, logger) {
  if (template === "none") return;

  const templatePath = path.join(pigletDir, "templates", template);

  await copyTemplateFiles(templatePath, targetDir, logger);

  if (template !== "structureOnly") return;

  const foldersToCreate = [
    "src/components",
    "src/modules",
    "src/public",
    "server/api",
  ];

  for (const folder of foldersToCreate) {
    const fullPath = path.join(targetDir, folder);
    if (!fs.existsSync(fullPath)) {
      await fsp.mkdir(fullPath, { recursive: true });
      logger("copy", folder);
    } else {
      logger("skip", folder);
    }
  }
}

/**
 * Optionally copies a browser extension template if user confirms.
 * @param {string} pigletDir - The PigletJS directory containing the extension.
 * @param {string} targetDir - The target directory where the extension should be copied.
 * @param {Logger['log']} logger - Optional logger function to log messages.
 * @returns {Promise<void>}
 */
async function maybeCopyExtension(pigletDir, targetDir, logger) {
  const extensionSrc = path.join(pigletDir, "extension");
  const extensionDest = path.join(targetDir, "extension");

  if (fs.existsSync(extensionDest)) {
    logger("skip", "extension");
  } else {
    await fsp.mkdir(extensionDest, { recursive: true });
    await copyTemplateFiles(extensionSrc, extensionDest, logger);
  }
}

/**
 * Runs a script to add the dev host to the system and starts the application.
 *
 * @param {string} dirname - The working directory in which to run the script.
 * @returns {Promise<void>} Resolves when the script completes successfully.
 */
function runAddHostAndStartApp(dirname) {
  return new Promise((resolve, reject) => {
    console.log("");
    console.msg("hosts.adding");

    const child = spawn("node", [path.join(dirname, "builder", "host.mjs")], {
      cwd: dirname,
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Starts the Piglet app setup process, optionally clearing templates,
 * applying a template, copying extension files, and setting up host entries.
 *
 * @param {string} dirname - Project root directory.
 * @param {boolean} devMode - Whether to build dev mode.
 * @returns {Promise<void>}
 */
async function start(dirname, devMode) {
  if (!devMode) {
    const { host, extension, files, preLog, template, aborted } =
      await runSetup();

    if (aborted) {
      process.exit(0);
    }

    const logger = createStackedLogger({ preLog });

    logger.create("copy", "Copied files");
    logger.create("skip", "Skipped files (existing)");
    logger.create("minify", "Minified files");

    for (const file of CONST.wizardFilesToCopy.prod) {
      const src = path.join(dirname, file.src);
      const dest = path.join(CURRENT_DIR, file.target ?? file.src);

      if (
        (files && files.includes(file.target ?? file.src)) ||
        file.target === "pig.mjs"
      ) {
        await copyFileSafe(src, dest, logger.log);
      }
    }

    await maybeUseTemplate(dirname, CURRENT_DIR, template, logger.log);
    if (extension) await maybeCopyExtension(dirname, CURRENT_DIR, logger.log);

    await prepareProd(dirname, CURRENT_DIR, logger.log);

    if (host) await runAddHostAndStartApp(dirname);

    console.log(
      CONST.consoleCodes.colors.orange +
        "\nRun 'node pig.mjs' to start the app!\n" +
        CONST.consoleCodes.colorReset,
    );

    process.exit(0);
  } else {
    const logger = createStackedLogger();

    logger.create("copy", "Copied files");
    logger.create("skip", "Skipped files (existing)");

    for (const file of CONST.wizardFilesToCopy.dev) {
      const src = path.join(dirname, file.src);
      const dest = path.join(CURRENT_DIR, file.target ?? file.src);

      await copyFileSafe(src, dest, logger.log);
    }

    await maybeUseTemplate(dirname, CURRENT_DIR, "exampleApp", logger.log);
  }
}

// noinspection JSUnusedGlobalSymbols
export default start;
