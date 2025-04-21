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
