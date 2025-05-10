import fs from "fs/promises";
import { resolvePath } from "@Piglet/utils/paths";
import console from "@Piglet/utils/console";
import CONST from "@Piglet/misc/CONST";

/**
 * Generates full HTML by injecting page content into the app shell,
 * replacing PascalCase component tags with kebab-case,
 * and adding script tags for components.
 *
 * @param {string} route - Route path
 * @returns {Promise<string|false>} - The full HTML content or false on failure.
 */
async function generateAppHtml(route) {
  "use strict";

  /** @type {Array<[RegExp, (match: string, attributes: string) => string]>} */
  const replacements = [
    [
      /<App([^>]*)\/>/g,
      (match, attributes) => `<app-root${attributes}></app-root>`,
    ],
    [/<App([^>]*)>/g, (match, attributes) => `<app-root${attributes}>`],
    [/<\/App>/g, () => `</app-root>`],
    [
      /<app-root([^>]*)>/g,
      (match, attributes) => `<app-root${attributes} route="${route}">`,
    ],
    [
      /<\/body>/g,
      () =>
        `<script type="module" src="${CONST.customRouteAliases.piglet}"></script></body>`,
    ],
  ];

  const appHtmlPath = resolvePath("@/Pig.html");
  try {
    const appHtml = await fs.readFile(appHtmlPath, "utf-8");

    return replacements.reduce(
      (html, [regex, replacement]) => html.replace(regex, replacement),
      appHtml,
    );
  } catch (err) {
    console.msg("pages.htmlGeneratingError", err);
    return false;
  }
}

export { generateAppHtml };
