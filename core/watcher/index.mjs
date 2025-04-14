import fs from "fs";
import { resolvePath } from "@/core/utils/paths.mjs";
import { processAllComponents } from "@/core/libs/componentBuilder.mjs";
import { createSubprocess, resetSubprocess } from "@/core/watcher/methods.mjs";
import "@/core/utils/console.mjs";
import { subprocessRef } from "@/core/watcher/subprocessRef.mjs";

const resetServer = (eventType, filename) =>
  resetSubprocess(eventType, filename, false);

const resetServerOnButtonClick = () =>
  resetSubprocess(undefined, undefined, true);

const directoriesToWatch = [
  "@/server",
  "@/core/watcher",
  "@/core/utils",
  "@/core/libs",
  "@/core/controllers",
];

for (const directory of directoriesToWatch) {
  fs.watch(resolvePath(directory), { recursive: true }, resetServer);
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
