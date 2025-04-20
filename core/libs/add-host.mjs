import os from "os";
import fs from "fs";

const HOST_ENTRY = "127.0.0.1 piglet.js";
const COMMENT_TAG = "# added by piglet script";
const ENTRY_LINE = `${HOST_ENTRY} ${COMMENT_TAG}`;

const platform = os.platform();
let hostsPath;

switch (platform) {
  case "win32":
    hostsPath = "C:\\Windows\\System32\\drivers\\etc\\hosts";
    break;
  case "darwin":
  case "linux":
    hostsPath = "/etc/hosts";
    break;
  default:
    console.error("❌ Unsupported OS:", platform);
    process.exit(1);
}

function modifyHosts() {
  let hosts;
  try {
    hosts = fs.readFileSync(hostsPath, "utf8");
  } catch (err) {
    console.error("❌ Could not read hosts file:", err.message);
    return;
  }

  if (hosts.includes(HOST_ENTRY)) {
    console.log("✔️ Hosts entry already exists.");
    return;
  }

  const updated = hosts.trimEnd() + `\n${ENTRY_LINE}\n`;

  try {
    fs.writeFileSync(hostsPath, updated, { encoding: "utf8" });
    console.log("✅ Added piglet.js to hosts!");
  } catch (err) {
    console.error(
      "❌ Failed to write to hosts file. Try running with elevated permissions.",
    );
    console.error(err.message);
  }
}

modifyHosts();
