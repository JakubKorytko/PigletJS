import fs from "fs";
import { resolvePath } from "@/core/utils/paths.mjs";
import { toKebabCase } from "@/core/utils/stringUtils.mjs";

/**
 * Loads the HTML content of a specific page.
 *
 * @param {string} fullPath - The name of the page to load.
 * @returns {Promise<string|false>} - The HTML content or false on failure.
 */
async function loadPage(fullPath) {
  "use strict";

  try {
    return await fs.promises.readFile(fullPath, "utf-8");
  } catch (err) {
    console.msg("pages.failedToLoad", fullPath, err);
    return false;
  }
}

/**
 * Generates full HTML by injecting page content into the app shell,
 * replacing PascalCase component tags with kebab-case,
 * and adding script tags for components.
 *
 * @param {string} fullPath - The name of the page to render.
 * @returns {Promise<string|false>} - The full HTML content or false on failure.
 */
async function generateAppHtml(route, fullPath) {
  "use strict";

  const appHtmlPath = resolvePath("@/Pig.html");
  try {
    let appHtml = await fs.promises.readFile(appHtmlPath, "utf-8");
    let pageContent = await loadPage(fullPath);

    if (!pageContent) {
      return false;
    }

    const componentTags = new Set(["App"]);
    const tagRegex =
      /<([A-Z][a-zA-Z0-9]*)[^>]*>.*?<\/\1>|<([A-Z][a-zA-Z0-9]*)[^>]*\/>/g;
    let match;

    while ((match = tagRegex.exec(pageContent)) !== null) {
      const pascalTag = match[1] || match[2];
      componentTags.add(pascalTag);
    }

    componentTags.forEach((tag) => {
      const kebabTag = tag === "App" ? "app-root" : toKebabCase(tag);

      const selfClosingTagRegex = new RegExp(`<${tag}([^>]*)/>`, "g");
      appHtml = appHtml.replace(
        selfClosingTagRegex,
        `<${kebabTag}$1></${kebabTag}>`,
      );

      appHtml = appHtml.replace(
        new RegExp(`<${tag}([^>]*)>`, "g"),
        `<${kebabTag}$1>`,
      );
      appHtml = appHtml.replace(new RegExp(`</${tag}>`, "g"), `</${kebabTag}>`);
    });

    appHtml = appHtml.replace(/<app-root([^>]*)>/g, (match, attributes) => {
      return `<app-root${attributes} route="${route}">`;
    });

    appHtml = appHtml.replace(
      /<app([^>]*)>(.*?)<\/app>/is,
      `<app$1>${pageContent}</app>`,
    );

    let scriptTags = fs.readFileSync(
      resolvePath("@/core/scripts.html"),
      "utf8",
    );

    appHtml = appHtml.replace("</body>", `${scriptTags}</body>`);

    return appHtml;
  } catch (err) {
    console.msg("pages.htmlGeneratingError", err);
    return false;
  }
}

export { generateAppHtml };
