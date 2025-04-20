import { spawn } from "child_process";
import { pathToFileURL } from "url";
import fs from "fs";

const runApplication = (rootDir) => {
  spawn(
    "node",
    [
      "--import",
      `"data:text/javascript,${encodeURIComponent(
        fs
          .readFileSync("./core/watcher/loader-arg.mjs", "utf8")
          .toString()
          .replace("__dirname", "./core/watcher/loader.mjs"),
      )}"`,
      "./core/watcher/index.mjs",
      `--rootDir="${pathToFileURL(rootDir)}"`,
    ],
    {
      stdio: "inherit",
      shell: true,
    },
  );
};

export default runApplication;
