import CONST from "@/src/CONST.mjs";
import path from "path";

/**
 * Resolves an input path, replacing aliases with corresponding directory paths.
 * If the input path contains an alias (e.g., "@/src/index.html"), it is resolved
 * to the appropriate file system path.
 *
 * @param {string} inputPath - The path to resolve, which may contain an alias.
 * @returns {string} - The resolved file system path.
 */
function resolvePath(inputPath) {
  if (inputPath.startsWith("@/")) {
    const aliasPath = inputPath.replace("@/", "");

    if (
      !Object.keys(CONST.directories).some((alias) =>
        aliasPath.startsWith(alias),
      )
    ) {
      return path.resolve(CONST.directories["@"], aliasPath);
    }

    for (const alias in CONST.directories) {
      if (aliasPath.startsWith(`${alias}/`) || aliasPath === alias) {
        const newPath = inputPath.replace(
          `@/${alias}`,
          CONST.directories[alias],
        );
        return path.resolve(newPath);
      }
    }
  }

  return path.resolve(inputPath);
}

/**
 * Extracts the root directory path from the command line arguments.
 * The root directory is specified via the "--rootDir=" flag in the process arguments.
 *
 * @param {Array<string>} processArgvArray - The array of command line arguments.
 * @returns {string|null} - The root directory path, or null if not specified.
 */
const getRootDirFromArgv = (processArgvArray) => {
  const arg = processArgvArray.find((value) => value.startsWith("--rootDir="));
  return arg ? arg.replace("--rootDir=", "") : null;
};

export { resolvePath, getRootDirFromArgv };
