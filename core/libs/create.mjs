import readline from "readline";
import fsp from "fs/promises";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import runApplication from "../spawn.mjs";
import CONST from "../CONST.mjs";
import "../utils/console.mjs";

function askYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
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

  const formatted = choices.map((c, i) => `${i + 1}) ${c}`).join("\n");
  return new Promise((resolve) => {
    rl.question(
      `${question}\n${formatted}\nSelect [1-${choices.length}]: `,
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
  const useTemplate = await askYesNo(
    "📦 Do you want to initialize the project with a template?",
  );
  if (!useTemplate) return;

  const type = await askChoice("Which template do you want to use?", [
    "Structure only (minimal setup)",
    "Full example (structure + sample app)",
  ]);

  const selected = type.startsWith("Full") ? "full" : "structure";
  const templatePath = path.join(dirname, "core", "templates", selected);

  console.msg("template.applyingTemplate", selected);
  await copyTemplateFiles(templatePath, dirname);

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

  const includeExtension = await askYesNo(
    CONST.consoleMessages.template.doYouWantExtension,
  );
  if (includeExtension) {
    const extensionSrc = path.join(dirname, "core", "extension");
    const extensionDest = path.join(dirname, "extension");

    if (fs.existsSync(extensionDest)) {
      console.msg("template.skipExtension");
    } else {
      console.msg("template.copyExtension");
      await fsp.mkdir(extensionDest, { recursive: true });
      await copyTemplateFiles(extensionSrc, extensionDest);
    }
  }
}

function runAddHostAndStartApp(dirname) {
  console.msg("hosts.adding");

  const child = spawn("node", ["./core/libs/add-host.mjs"], {
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
  if (create) {
    await maybeUseTemplate(dirname);

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
    runApplication(dirname);
  }
}

export default start;
