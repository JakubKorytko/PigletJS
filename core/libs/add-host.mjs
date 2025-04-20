import os from "os";
import fs from "fs";
import "../utils/console.mjs";

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
    console.msg("hosts.unsupportedOS", platform);
    process.exit(1);
}

function modifyHosts() {
  let hosts;
  try {
    hosts = fs.readFileSync(hostsPath, "utf8");
  } catch (err) {
    console.msg("hosts.couldntReadtHostFile", err.message);
    return;
  }

  if (hosts.includes(HOST_ENTRY)) {
    console.msg("hosts.hostExists");
    return;
  }

  const updated = hosts.trimEnd() + `\n${ENTRY_LINE}\n`;

  try {
    fs.writeFileSync(hostsPath, updated, { encoding: "utf8" });
    console.msg("hosts.addedToHosts");
  } catch (err) {
    console.msg("hosts.failedToAddHost");
    console.error(err.message);
  }
}

modifyHosts();
