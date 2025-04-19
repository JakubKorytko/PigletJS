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
    // Try to read the file from the resolved path
    return await fs.promises.readFile(fullPath, "utf-8");
  } catch (err) {
    console.msg("pages.failedToLoad", fullPath, err);
    return false; // Return false if the file couldn't be loaded
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

  console.log("fullPath", fullPath);

  const appHtmlPath = resolvePath("@/Pig.html");
  try {
    let appHtml = await fs.promises.readFile(appHtmlPath, "utf-8");
    let pageContent = await loadPage(fullPath);

    if (!pageContent) {
      return false;
    }

    const componentTags = new Set(["App"]); // zawsze dołącz App jako komponent bazowy
    const tagRegex =
      /<([A-Z][a-zA-Z0-9]*)[^>]*>.*?<\/\1>|<([A-Z][a-zA-Z0-9]*)[^>]*\/>/g;
    let match;

    while ((match = tagRegex.exec(pageContent)) !== null) {
      const pascalTag = match[1] || match[2];
      componentTags.add(pascalTag);
    }

    componentTags.forEach((tag) => {
      const kebabTag = tag === "App" ? "app-root" : toKebabCase(tag); // specjalny przypadek dla App

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

    // Dynamically add route to <app-root> tag
    appHtml = appHtml.replace(
      /<app-root([^>]*)>/g, // Match <app-root> with optional attributes
      (match, attributes) => {
        return `<app-root${attributes} route="${route}">`; // Add route attribute
      },
    );

    appHtml = appHtml.replace(
      /<app([^>]*)>(.*?)<\/app>/is,
      `<app$1>${pageContent}</app>`,
    );

    let scriptTags = fs.readFileSync(
      resolvePath("@/core/scripts.html"),
      "utf8",
    );

    console.log("");

    appHtml = appHtml.replace("</body>", `${scriptTags}</body>`);

    return appHtml;
  } catch (err) {
    console.msg("pages.htmlGeneratingError", err);
    return false;
  }
}

export { generateAppHtml };
