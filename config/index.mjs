import { processAllComponents } from "@/server/componentBuilder.mjs";
import "@/server/index.mjs";

/**
 * Logs the server start message and listens for user input.
 * Allows for reloading components by pressing "r" and stopping the server with Ctrl+C.
 */
console.msg("server.start");

process.stdin.setEncoding("utf-8");
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("data", async (key) => {
  "use strict";

  if (key === "r") {
    console.msg("components.reloading");
    try {
      await processAllComponents();
      console.msg("components.regenerated");
    } catch (err) {
      console.msg("components.regeneratingError", err);
    }
  }

  if (key === "\u0003") {
    console.msg("server.shuttingDown");
    process.exit();
  }
});
