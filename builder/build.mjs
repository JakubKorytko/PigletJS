// PigletJS/setup.mjs
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import readline from "readline";
import { spawn } from "child_process";
import CONST from "../misc/CONST.mjs";
import "../utils/console.mjs";

const CURRENT_DIR = process.cwd();

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
 * Asks a question in the console and returns the user's input.
 *
 * @param {string} query The question to ask the user.
 * @returns {Promise<string>} A promise that resolves to the user's response.
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const yellow = "\x1b[33m";
    const reset = "\x1b[0m";
    const emoji = "💬 ";

    rl.question(`${yellow}${emoji}${query}${reset}`, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Copies a file from `src` to `dest` if the destination does not already exist.
 *
 * @param {string} src The source file path.
 * @param {string} dest The destination file path.
 * @returns {Promise<void>} A promise that resolves when the file is copied, or skips if the file exists.
 */
async function copyFileSafe(src, dest) {
  const exists = await fileExists(dest);
  if (exists) {
    console.msg(
      "builder.skippingExistingFile",
      path.relative(CURRENT_DIR, dest),
    );
    return;
  }
  await fsp.copyFile(src, dest);
  console.msg("builder.copiedFile", path.basename(dest));
}

/**
 * Sets up the PigletJS environment by copying necessary files and asking the user for extra setup options.
 *
 * @param {string} pigletDir Piglet directory path
 * @returns {Promise<void>} A promise that resolves when the setup is complete.
 */
async function setupPiglet(pigletDir) {
  await console.printPigAscii();

  console.msg("builder.start");
  const pigletStart = path.join(pigletDir, "start.mjs");
  const startDest = path.join(CURRENT_DIR, "start.mjs");

  if (!(await fileExists(pigletStart))) {
    console.msg("builder.noPigletFolder");
    return;
  }

  await copyFileSafe(pigletStart, startDest);

  console.log("");
  const answer = await askQuestion(CONST.consoleMessages.builder.promptExtras);
  if (answer !== "y") {
    console.msg("builder.runningStart");
    spawn("node", [startDest, "--create"], { stdio: "inherit" });
    return;
  }

  console.log("");

  const filesToCopy = [
    { src: "README.md" },
    { src: ".gitignore" },
    { src: "package.json" },
  ];

  for (const file of filesToCopy) {
    const src = path.join(pigletDir, file.src);
    const dest = path.join(CURRENT_DIR, file.src);
    await copyFileSafe(src, dest);
  }

  const jsconfig_src = path.join(
    pigletDir,
    "builder",
    "static",
    "jsconfig.json",
  );

  const jsconfig_dest = path.join(CURRENT_DIR, "jsconfig.json");

  await copyFileSafe(jsconfig_src, jsconfig_dest);

  const profileSrc = path.join(
    pigletDir,
    "builder",
    "static",
    "Project_Default.xml",
  );

  const profileDir = path.join(CURRENT_DIR, ".idea", "inspectionProfiles");
  const profileDest = path.join(profileDir, "Project_Default.xml");

  if (!(await fileExists(profileDest))) {
    await fsp.mkdir(profileDir, { recursive: true });
    await fsp.copyFile(profileSrc, profileDest);
    console.msg(
      "builder.copiedProfile",
      path.relative(CURRENT_DIR, profileDest),
    );
  } else {
    console.msg(
      "builder.profileExists",
      path.relative(CURRENT_DIR, profileDest),
    );
  }

  const webResourcesSrc = path.join(
    pigletDir,
    "builder",
    "static",
    "webResources.xml",
  );
  const webResourcesDir = path.join(CURRENT_DIR, ".idea");
  const webResourcesDest = path.join(webResourcesDir, "webResources.xml");

  if (!(await fileExists(webResourcesDest))) {
    await fsp.mkdir(webResourcesDir, { recursive: true });
    await fsp.copyFile(webResourcesSrc, webResourcesDest);
    console.msg(
      "builder.copiedProfile",
      path.relative(CURRENT_DIR, webResourcesDest),
    );
  } else {
    console.msg(
      "builder.profileExists",
      path.relative(CURRENT_DIR, webResourcesDest),
    );
  }

  console.msg("builder.runningStart");
  const proc = spawn("node", [startDest, "--create"], { stdio: "inherit" });

  proc.on("exit", (code) => {
    console.msg("builder.startExitCode", code);
  });
}

export default setupPiglet;
