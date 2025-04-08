import fs from "fs";
import { fork } from "child_process";
import { getRootDirFromArgv, resolvePath } from "@/config/utils.mjs";
import { processAllComponents } from "@/server/libs/componentBuilder.mjs";

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
let subprocess = createSubprocess();

/**
 * Resets the server subprocess if a relevant file change is detected.
 *
 * @param {string} eventType - The type of the file system event (e.g., "change").
 * @param {string} filename - The name of the file that triggered the event.
 */
const resetServer = (eventType, filename) => {
  if (filename && filename.endsWith(".mjs")) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      subprocess.kill("SIGINT");
      subprocess = createSubprocess(["--restart"]);
    }, 500);
  }
};

fs.watch(resolvePath("@/server"), { recursive: true }, resetServer);
fs.watch(resolvePath("@/config"), { recursive: true }, resetServer);

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", async (key) => {
  "use strict";

  if (key === "r") {
    console.log("\n🔁 Reloading all components...");
    try {
      await processAllComponents();
      console.log("✅ Components have been successfully regenerated.");
    } catch (err) {
      console.error("❌ Error while regenerating components:", err);
    }
  }

  if (key === "s") {
    console.log("\n🔁 Restarting server...");
    subprocess.kill("SIGINT");
    subprocess = createSubprocess(["--restart"]);
  }

  if (key === "\u0003") {
    console.log("\n👋 Shutting down the server...");
    process.exit();
  }
});
