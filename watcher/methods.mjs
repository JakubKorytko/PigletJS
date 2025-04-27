import fs from "fs";
import path from "path";
import { fork } from "child_process";
import { getRootDirFromArgv, resolvePath } from "@Piglet/utils/paths";
import { buildComponent } from "@Piglet/parser/component";
import { subprocessRef } from "@Piglet/watcher/subprocessRef";
import { reloadClients, fullReload } from "@Piglet/libs/socket";
import { toKebabCase } from "@Piglet/utils/stringUtils";

/**
 * Creates a subprocess for running the server.
 *
 * @param {Array<string>} [args=[]] - Optional arguments to pass to the server subprocess.
 * @returns {typeof ChildProcess} - The forked subprocess.
 */
const createSubprocess = (args = []) => {
  try {
    const entryPath = resolvePath("@/server/index.mjs");

    if (!fs.existsSync(entryPath)) {
      console.error(`\n⚠️  Entry file not found: ${entryPath}`);
      console.error(
        "💡 Please create '@/server/index.mjs' before running the process.\n",
      );
      process.exit(1);
      return null;
    }

    return fork(
      entryPath,
      [`--rootDir=${getRootDirFromArgv(process.argv)}`, ...args],
      {},
    );
  } catch (error) {
    console.error("Failed to create subprocess:", error.message);
    return null;
  }
};

let debounceTimeout;

/**
 * Resets the server subprocess if a relevant file change is detected.
 *
 * @param {string} eventType - The type of the file system event (e.g., "change").
 * @param {string} filename - The name of the file that triggered the event.
 * @param {boolean} [forced=false] - Whether to force a restart regardless of file type.
 */
const resetSubprocess = (eventType, filename, forced = false) => {
  if (forced || (filename && filename.endsWith(".mjs"))) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      subprocessRef.instance.kill("SIGINT");
      subprocessRef.instance = null;
      subprocessRef.instance = createSubprocess(["--restart"]);
    }, 500);
  }
};

/**
 * Watches the components directory for changes and rebuilds modified components.
 */
const watchDirectory = () => {
  let debounceTimeout;

  fs.watch(
    resolvePath("@/components"),
    { recursive: true },
    (eventType, filename) => {
      if (filename && filename.includes(".pig.")) {
        const htmlFilename = path.format({
          ...path.parse(filename),
          base: "",
          ext: ".html",
        });

        const socketData = toKebabCase(htmlFilename.replace(".pig.html", ""));

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const filePath = resolvePath(`@/components/${htmlFilename}`);
          console.msg("components.changed", htmlFilename);
          buildComponent(filePath)
            .catch((err) => console.msg("components.generatingError", err))
            .then(() => reloadClients(socketData));
        }, 500);
      }
    },
  );

  console.msg("components.watchingForChanges", resolvePath("@/components"));

  fs.watch(
    resolvePath("@/pages"),
    { recursive: true },
    (eventType, filename) => {
      if (filename && filename.includes(".pig.")) {
        const htmlFilename = path.format({
          ...path.parse(filename),
          base: "",
          ext: ".html",
        });

        const socketData = toKebabCase(htmlFilename.replace(".pig.html", ""));

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const filePath = resolvePath(`@/pages/${htmlFilename}`);
          console.msg("components.changed", htmlFilename);
          buildComponent(filePath)
            .catch((err) => console.msg("pages.generatingError", err))
            .then(() => reloadClients(socketData));
        }, 500);
      }
    },
  );

  console.msg("components.watchingForChanges", resolvePath("@/pages"));

  const filesForFullReload = [resolvePath("@/Pig.html")];

  for (const file of filesForFullReload) {
    fs.watchFile(file, { interval: 500 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.msg("components.fullReloadTriggered", file);
        fullReload();
      }
    });

    console.msg("components.watchingForChanges", file);
  }
};

export { watchDirectory, resetSubprocess, createSubprocess };
