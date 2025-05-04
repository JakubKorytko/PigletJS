import { spawn } from "child_process";
import { pathToFileURL } from "url";
import fs from "fs";
import CONST from "../misc/CONST.mjs";

/**
 * Runs the application by spawning a child process and executing the necessary scripts.
 *
 * This function launches the application using `node`, passing a data URL that includes a
 * dynamically loaded script (`loader-arg.mjs`), along with an additional script (`index.mjs`).
 * It sets the `rootDir` argument as a URL for the application to use.
 *
 * @param {string} rootDir - The root directory path for the application, which will be passed to the loader script.
 * @param {boolean} prod - Whether the production build is being run.
 */
const runApplication = (rootDir, prod) => {
  spawn(
    "node",
    [
      "--import",
      `"data:text/javascript,${encodeURIComponent(
        fs
          .readFileSync(
            `./${CONST.dirPath(prod)}/watcher/loader-arg.mjs`,
            "utf8",
          )
          .toString()
          .replace("__dirname", `./${CONST.dirPath(prod)}/watcher/loader.mjs`),
      )}"`,
      `./${CONST.dirPath(prod)}/watcher/index.mjs`,
      `--rootDir="${pathToFileURL(rootDir)}"`,
    ],
    {
      env: {
        NODE_ENV: prod ? "production" : "development",
      },
      stdio: "inherit",
      shell: true,
    },
  );
};

export default runApplication;
