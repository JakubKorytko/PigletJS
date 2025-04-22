import { spawn } from "child_process";
import { pathToFileURL } from "url";
import fs from "fs";

/**
 * Runs the application by spawning a child process and executing the necessary scripts.
 *
 * This function launches the application using `node`, passing a data URL that includes a
 * dynamically loaded script (`loader-arg.mjs`), along with an additional script (`index.mjs`).
 * It sets the `rootDir` argument as a URL for the application to use.
 *
 * @param {string} rootDir The root directory path for the application, which will be passed to the loader script.
 */
const runApplication = (rootDir) => {
  spawn(
    "node",
    [
      "--import",
      `"data:text/javascript,${encodeURIComponent(
        fs
          .readFileSync("./PigletJS/watcher/loader-arg.mjs", "utf8")
          .toString()
          .replace("__dirname", "./PigletJS/watcher/loader.mjs"),
      )}"`,
      "./PigletJS/watcher/index.mjs",
      `--rootDir="${pathToFileURL(rootDir)}"`,
    ],
    {
      stdio: "inherit",
      shell: true,
    },
  );
};

export default runApplication;
