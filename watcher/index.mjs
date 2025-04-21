import fs from "fs";
import { resolvePath } from "@Piglet/utils/paths.mjs";
import { processAllComponents } from "@Piglet/libs/componentBuilder.mjs";
import { createSubprocess, resetSubprocess } from "@Piglet/watcher/methods.mjs";
import "@Piglet/utils/console.mjs";
import { subprocessRef } from "@Piglet/watcher/subprocessRef.mjs";

const resetServer = (eventType, filename) =>
  resetSubprocess(eventType, filename, false);

const resetServerOnButtonClick = () =>
  resetSubprocess(undefined, undefined, true);

const directoriesToWatch = [
  "@/server",
  "@Piglet/watcher",
  "@Piglet/utils",
  "@Piglet/libs",
  "@Piglet/controllers",
];

for (const directory of directoriesToWatch) {
  const fullPath = resolvePath(directory);
  if (fs.existsSync(fullPath)) {
    fs.watch(fullPath, { recursive: true }, resetServer);
  } else {
    console.log(`Directory ${fullPath} does not exist`);
  }
}

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);
process.stdin.resume();

subprocessRef.instance = createSubprocess();

process.stdin.on("data", async (key) => {
  "use strict";

  if (key === "r") {
    console.msg("components.reloading");
    try {
      await processAllComponents();
      console.msg("components.regenerated");
      subprocessRef.instance.send({ type: "reload" });
    } catch (err) {
      console.msg("components.regeneratingError", err);
    }
  }

  if (key === "s") {
    console.msg("server.restarting");
    resetServerOnButtonClick();
  }

  if (key === "\u0003") {
    console.msg("server.shuttingDown");
    subprocessRef.instance.kill("SIGINT");
    subprocessRef.instance = null;
    process.exit();
  }
});
