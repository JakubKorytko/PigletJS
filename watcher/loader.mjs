import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import CONST from "../misc/CONST.mjs";

let projectRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);

const isProd = process.env.NODE_ENV === "production";

/**
 * Resolves a module specifier to an absolute file path, handling aliases like "@/".
 * If the resolved path doesn't exist, attempts to append the ".mjs" extension
 * or resolve to an "index.mjs" file.
 *
 * @param {string} specifier - The module specifier to resolve, potentially containing an alias.
 * @param {object} context - The context for resolution, typically provided by Node's module loader.
 * @param {Function} nextResolve - The function to call to continue resolving the specifier.
 * @returns {Promise<string>} - A promise resolving to the resolved file URL.
 */

// noinspection JSUnusedGlobalSymbols
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/") || specifier.startsWith("@Piglet/")) {
    const modifiedSpecifier = specifier.replace(
      "@Piglet/",
      `@/${CONST.dirPath(isProd)}/`,
    );
    let targetPath = path.resolve(projectRoot, modifiedSpecifier.slice(2));

    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(targetPath + ".mjs")) {
        targetPath += ".mjs";
      } else if (fs.existsSync(path.join(targetPath, "index.mjs"))) {
        targetPath = path.join(targetPath, "index.mjs");
      }
    }

    return nextResolve(pathToFileURL(targetPath).href, context);
  }

  return nextResolve(specifier, context);
}
