import fs from "fs/promises";
import { resolvePath } from "@Piglet/utils/paths";
import console from "@Piglet/utils/console";
import CONST from "@Piglet/misc/CONST";

/**
 * @type {(html: string, route: string) => string}
 * Transforms PascalCase 'App' component to 'app-root' with injected route
 */
const transformAppTags = function (html, route) {
  return html.replace(/<\/?App([^>]*)\/?>/g, (_, attrs = "") => {
    const isClosing = _.startsWith("</");
    const isSelfClosing = _.endsWith("/>");

    if (isClosing) return `</app-root>`;
    const finalAttrs = `${attrs} route="${route}"`;
    return isSelfClosing
      ? `<app-root${finalAttrs}></app-root>`
      : `<app-root${finalAttrs}>`;
  });
};

/**
 * @type {(html: string, scriptSrc: string) => string}
 * Injects a script tag before the closing body tag
 */
const injectScriptBeforeBody = function (html, scriptSrc) {
  return html.replace(
    /<\/body>/g,
    () => `<script type="module" src="${scriptSrc}"></script></body>`,
  );
};

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

  const appHtmlPath = resolvePath("@/Pig.html");
  try {
    const appHtml = await fs.readFile(appHtmlPath, "utf-8");
    const withAppRoot = transformAppTags(appHtml, route);
    return injectScriptBeforeBody(withAppRoot, CONST.customRouteAliases.piglet);
  } catch (err) {
    console.msg("pages.htmlGeneratingError", err);
    return false;
  }
}

export { generateAppHtml };
