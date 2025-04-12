import fs from "fs";
import { resolvePath } from "@/utils/paths.mjs";
import { toKebabCase } from "@/utils/stringUtils.mjs";

/**
 * Loads the HTML content of a specific page.
 *
 * @param {string} pageName - The name of the page to load.
 * @returns {Promise<string|false>} - The HTML content or false on failure.
 */
async function loadPage(pageName) {
  "use strict";

  // Rozdzielamy ścieżkę na katalogi i nazwę pliku
  const pathSegments = pageName.split("/");

  // Rekursywnie szukamy pliku w podkatalogach
  for (let i = 1; i <= pathSegments.length; i++) {
    const subPath = pathSegments.slice(0, i).join("/"); // Tworzymy ścieżkę do podkatalogu
    const pagePath = resolvePath(`@/pages/${subPath}.html`);

    try {
      // Sprawdzamy, czy plik istnieje w danej ścieżce
      return await fs.promises.readFile(pagePath, "utf-8");
    } catch (err) {
      // Jeśli nie uda się wczytać pliku, kontynuujemy próby w wyższych katalogach
      if (i === pathSegments.length) {
        console.msg("pages.failedToLoad", pageName, err);
        return false; // Po ostatniej próbie zwracamy błąd
      }
    }
  }

  return false; // Jeśli plik nie został znaleziony
}

/**
 * Generates full HTML by injecting page content into the app shell,
 * replacing PascalCase component tags with kebab-case,
 * and adding script tags for components.
 *
 * @param {string} pageName - The name of the page to render.
 * @returns {Promise<string|false>} - The full HTML content or false on failure.
 */
async function generateAppHtml(pageName) {
  "use strict";

  const appHtmlPath = resolvePath("@/app.html");
  try {
    let appHtml = await fs.promises.readFile(appHtmlPath, "utf-8");
    let pageContent = await loadPage(pageName);

    if (!pageContent) {
      return false;
    }

    const componentTags = new Set();
    const tagRegex =
      /<([A-Z][a-zA-Z0-9]*)[^>]*>.*?<\/\1>|<([A-Z][a-zA-Z0-9]*)[^>]*\/>/g;
    let match;

    while ((match = tagRegex.exec(pageContent)) !== null) {
      const pascalTag = match[1] || match[2];
      componentTags.add(pascalTag);
    }

    // Replace PascalCase component tags with kebab-case
    componentTags.forEach((tag) => {
      const kebabTag = toKebabCase(tag);

      // Convert self-closing tags (<Tag />) to standard tags (<Tag></Tag>)
      const selfClosingTagRegex = new RegExp(`<${tag}([^>]*)/>`, "g");
      pageContent = pageContent.replace(
        selfClosingTagRegex,
        `<${kebabTag}$1></${kebabTag}>`,
      );

      // Replace opening and closing PascalCase tags with kebab-case
      pageContent = pageContent.replace(
        new RegExp(`<${tag}([^>]*)>`, "g"),
        `<${kebabTag}$1>`,
      );
      pageContent = pageContent.replace(
        new RegExp(`</${tag}>`, "g"),
        `</${kebabTag}>`,
      );
    });

    // Add <script> tags for each component before the closing </body> tag
    let scriptTags = "";
    componentTags.forEach((tag) => {
      const scriptTag = `<script src="component/${tag}"></script>`;
      scriptTags += `${scriptTag}\n`; // Append each script tag
    });

    // Add the script tags at the end of the body section
    appHtml = appHtml.replace("</body>", `${scriptTags}</body>`);

    // Inject page content into the app shell
    appHtml = appHtml.replace("<!-- PAGE_CONTENT -->", pageContent);
    return appHtml;
  } catch (err) {
    console.msg("pages.htmlGeneratingError", err);
    return false;
  }
}

export { generateAppHtml };
