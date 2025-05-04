import os from "os";
import fs from "fs";
import console from "../utils/console.mjs";

/**
 * Host entry to be added to the hosts file.
 * Redirects piglet.js to localhost.
 * @type {string}
 */
const HOST_ENTRY = "127.0.0.1 piglet.js";

/**
 * Comment tag used to identify the Piglet script entry.
 * @type {string}
 */
const COMMENT_TAG = "# added by piglet script";

/**
 * Full line that will be appended to the hosts file.
 * @type {string}
 */
const ENTRY_LINE = `${HOST_ENTRY} ${COMMENT_TAG}`;

/**
 * Platform identifier, e.g., 'win32', 'darwin', or 'linux'.
 * @type {NodeJS.Platform}
 */
const platform = os.platform();

/**
 * Absolute path to the system hosts file, depending on the OS.
 * @type {string}
 */
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

/**
 * Adds an entry for `piglet.js` to the system hosts file if it doesn't already exist.
 * This ensures that requests to `piglet.js` are redirected to localhost.
 * Requires administrator/root privileges to modify the hosts file.
 */
function modifyHosts() {
  let hosts;
  try {
    hosts = fs.readFileSync(hostsPath, "utf8");
  } catch (err) {
    console.msg("hosts.couldntReadHostFile", err.message);
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

// Run script
modifyHosts();
