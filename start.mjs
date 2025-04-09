import { spawn } from "child_process";
import { pathToFileURL } from "url";
import fs from "fs";

spawn(
  "node",
  [
    "--import",
    `data:text/javascript,${encodeURIComponent(
      fs
        .readFileSync("./watcher/loader-arg.mjs", "utf8")
        .toString()
        .replace("__dirname", "./watcher/loader.mjs"),
    )}`,
    "./watcher/index.mjs",
    `--rootDir="${pathToFileURL(import.meta.dirname)}"`,
  ],
  {
    stdio: "inherit",
    shell: true,
  },
);
