import { processAllComponents } from "@/server/libs/componentBuilder.mjs";
import "@/server/index.mjs";

/**
 * Logs the server start message and listens for user input.
 * Allows for reloading components by pressing "r" and stopping the server with Ctrl+C.
 */
console.log('🔧 Server is starting... Press "r" to reload components.');

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

  if (key === "\u0003") {
    console.log("\n👋 Shutting down the server...");
    process.exit();
  }
});
