import fs from "fs/promises";
import { resolvePath } from "@Piglet/utils/paths";
import console from "@Piglet/utils/console";

/**
 * @typedef {Object} WebTypesAttribute
 * @property {string} name - The name of the attribute.
 * @property {string} [description] - Optional description of the attribute.
 * @property {{ kind: string, type: string }} [value] - Optional value type definition.
 * @property {boolean} required
 */

/**
 * @typedef {Object} WebTypesElement
 * @property {string} name - The tag name of the custom element (e.g., 'render-if').
 * @property {string} [description] - Optional description of the element.
 * @property {WebTypesAttribute[]} [attributes] - Optional list of supported attributes.
 */

/**
 * Merges a list of new elements into the `web-types.json` file.
 * It loads `native-web-types.json`, adds any new valid elements (not already present),
 * and saves the result into `web-types.json` (overwriting if exists).
 *
 * @param {WebTypesElement[]} newElements - List of elements to merge.
 */
export async function mergeWebTypes(newElements) {
  const basePath = resolvePath("@Piglet/builder/native-web-types.json");
  const outputPath = resolvePath("./web-types.json");

  let baseJson;
  try {
    const file = await fs.readFile(basePath, "utf-8");
    baseJson = JSON.parse(file);
  } catch (err) {
    console.msg("webTypes.failedToLoad", basePath, err);
    return;
  }

  if (!baseJson.contributions?.html?.elements) {
    baseJson.contributions = baseJson.contributions || {};
    baseJson.contributions.html = baseJson.contributions.html || {};
    baseJson.contributions.html.elements = [];
  }

  const existingNames = new Set(
    baseJson.contributions.html.elements.map((el) => el.name),
  );

  let addedCount = 0;

  for (const el of newElements) {
    if (el && el.name && !existingNames.has(el.name)) {
      baseJson.contributions.html.elements.push(el);
      existingNames.add(el.name);
      addedCount++;
    }
  }

  try {
    await fs.writeFile(outputPath, JSON.stringify(baseJson, null, 2), "utf-8");
    console.msg("webTypes.added", addedCount);
  } catch (err) {
    console.msg("webTypes.failedToWrite", outputPath, err);
  }
}
