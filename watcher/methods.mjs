import fs from "fs";
import { fork } from "child_process";
import { getRootDirFromArgv, resolvePath } from "@/utils/paths.mjs";
import { buildComponent } from "@/server/libs/componentBuilder.mjs";
import { subprocessRef } from "@/watcher/subprocessRef.mjs";

/**
 * Creates a subprocess for running the server.
 *
 * @param {Array<string>} [args=[]] - Optional arguments to pass to the server subprocess.
 * @returns {ChildProcess} - The forked subprocess.
 */
const createSubprocess = (args = []) =>
  fork(
    resolvePath(`@/server/index.mjs`),
    [`--rootDir=${getRootDirFromArgv(process.argv)}`, ...args],
    {},
  );

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
function watchDirectory() {
  let debounceTimeout;

  fs.watch(
    resolvePath("@/components"),
    { recursive: true },
    (eventType, filename) => {
      if (filename && filename.endsWith(".cc.html")) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const filePath = resolvePath(`@/components/${filename}`);
          console.msg("components.changed", filename);
          buildComponent(filePath).catch((err) =>
            console.msg("components.generatingError", err),
          );
        }, 500);
      }
    },
  );

  console.msg("components.watchingForChanges", resolvePath("@/components"));
}

export { watchDirectory, resetSubprocess, createSubprocess };
