// PigletJS/setup.mjs
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import readline from "readline";
import { spawn } from "child_process";
import CONST from "./CONST.mjs";
import "./utils/console.mjs";

const CURRENT_DIR = process.cwd();
const SCRIPT_DIR = import.meta.dirname;
const PIGLET_DIR = SCRIPT_DIR;

async function fileExists(filepath) {
  try {
    await fsp.access(filepath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

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

async function setupPiglet() {
  await console.printPigAscii();

  console.msg("builder.start");
  const pigletStart = path.join(PIGLET_DIR, "start.mjs");
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
    const proc = spawn("node", [startDest, "--create"], { stdio: "inherit" });
    return;
  }
  console.log("");

  const filesToCopy = [
    { src: "README.md" },
    { src: "root_jsconfig.json", dest: "jsconfig.json" },
    { src: ".gitignore" },
  ];

  for (const file of filesToCopy) {
    const src = path.join(PIGLET_DIR, file.src);
    const dest = path.join(CURRENT_DIR, file.dest || file.src);
    await copyFileSafe(src, dest);
  }

  const profileSrc = path.join(PIGLET_DIR, "Project_Default.xml");
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

  console.msg("builder.runningStart");
  const proc = spawn("node", [startDest, "--create"], { stdio: "inherit" });

  proc.on("exit", (code) => {
    console.msg("builder.startExitCode", code);
  });
}

setupPiglet();
