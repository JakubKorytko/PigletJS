import fs from "fs";
import { resolvePath } from "@/src/utils/paths.mjs";
import { processAllComponents } from "@/server/componentBuilder.mjs";
import { createSubprocess, resetSubprocess } from "@/watcher/methods.mjs";
import "@/src/utils/console.mjs";

let subprocess = createSubprocess();

const resetServer = (eventType, filename) =>
  resetSubprocess(subprocess, eventType, filename);

fs.watch(resolvePath("@/server"), { recursive: true }, resetServer);
fs.watch(resolvePath("@/config"), { recursive: true }, resetServer);

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", async (key) => {
  "use strict";

  if (key === "r") {
    console.msg("server.reloading");
    try {
      await processAllComponents();
      console.msg("server.regenerated");
    } catch (err) {
      console.msg("server.regeneratingError", err);
    }
  }

  if (key === "s") {
    console.msg("server.restarting");
    subprocess.kill("SIGINT");
    subprocess = createSubprocess(["--restart"]);
  }

  if (key === "\u0003") {
    console.msg("server.shuttingDown");
    process.exit();
  }
});
