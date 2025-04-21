import readline from "readline";
import fsp from "fs/promises";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import runApplication from "../spawn.mjs";
import CONST from "../CONST.mjs";
import "../utils/console.mjs";

async function clearTemplates(dirname) {
  const templatesPath = path.join(dirname, "PigletJS", "templates");
  const extensionPath = path.join(dirname, "PigletJS", "extension");

  try {
    if (fs.existsSync(templatesPath)) {
      await fsp.rm(templatesPath, { recursive: true, force: true });
      console.msg("template.templatesRemoved");
    } else {
      console.msg("template.templatesDoNotExists");
    }

    if (fs.existsSync(extensionPath)) {
      await fsp.rm(extensionPath, { recursive: true, force: true });
      console.msg("template.extensionRemoved");
    } else {
      console.msg("template.extensionDoNotExists");
    }
  } catch (err) {
    console.msg("template.errorRemoving", err);
  }
}

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

async function maybeUseTemplate(dirname) {
  const useTemplate = await askYesNo(CONST.consoleMessages.template.initialize);
  if (!useTemplate) return;

  const type = await askChoice(CONST.consoleMessages.template.whichTemplate, [
    CONST.consoleMessages.template.full,
    CONST.consoleMessages.template.structure,
  ]);

  console.log(type);
  const selected = type.startsWith("⭐ Full") ? "full" : "structure";
  const templatePath = path.join(dirname, "PigletJS", "templates", selected);

  console.log("");
  console.msg("template.applyingTemplate", selected);
  await copyTemplateFiles(templatePath, dirname);
  console.log("");

  if (selected === "structure") {
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

async function maybeCopyExtension(dirname) {
  console.log("");
  const includeExtension = await askYesNo(
    CONST.consoleMessages.template.doYouWantExtension,
  );
  console.log("");
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
    console.log("");
  }
}

function runAddHostAndStartApp(dirname) {
  console.log("");
  console.msg("hosts.adding");

  const child = spawn("node", ["./PigletJS/libs/add-host.mjs"], {
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

async function start(dirname, create, host, clear) {
  if (clear) {
    await clearTemplates(dirname);
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

export default start;
