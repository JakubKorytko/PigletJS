import runApplication from "./core/spawn.mjs";
import { spawn } from "child_process";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags
const args = process.argv.slice(2);
const hasNoHostFlag = args.includes("--no-host");
const hasAddHostFlag = args.includes("--add-host");

// Create CLI prompt
function askYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

function runAddHostAndStartApp() {
  console.log("➕ Adding piglet.js to your hosts...");

  const child = spawn("node", ["./core/libs/add-host.mjs"], {
    cwd: import.meta.dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code === 0) {
      console.log("✅ Successfully added piglet.js to hosts!");
    } else {
      console.log(
        "⚠️ Failed to update hosts file. Try running this script as administrator.",
      );
    }
    runApplication(import.meta.dirname);
  });
}

async function start() {
  if (hasNoHostFlag) {
    runApplication(import.meta.dirname);
    return;
  }

  if (hasAddHostFlag) {
    runAddHostAndStartApp();
    return;
  }

  const shouldAddHost = await askYesNo(
    "🔧 Do you want to add piglet.js to your hosts file? (Requires admin privileges)",
  );

  if (shouldAddHost) {
    runAddHostAndStartApp();
  } else {
    runApplication(import.meta.dirname);
  }
}

start();
