import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { resolvePath } from "@Piglet/utils/paths";
import {
  toKebabCase,
  toPascalCase,
  extractComponentTagsFromString,
} from "@Piglet/libs/helpers";
import { parseRoutes, routes } from "@Piglet/libs/routes";
import { formatHTML, formatJS } from "@Piglet/parser/format";
import CONST from "@Piglet/misc/CONST";
import console from "@Piglet/utils/console";

/**
 * Extracts import statements from JavaScript code and returns the cleaned code.
 *
 * @param {string} code - The JavaScript source code.
 * @returns {{ imports: string[], cleanedCode: string }}
 */
function extractAndRemoveImports(code) {
  const importRegex = /^import\s+[\s\S]*?["'][^"']+["'];?/gm;
  const imports = [];
  let cleaned;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    let importStatement = match[0];

    importStatement = importStatement
      .replace(/(['"])@Piglet\/browser\//g, "$1/Piglet/")
      .replace(/(['"])@\/modules\//g, "$1/module/");

    imports.push(importStatement);
  }

  cleaned = code.replace(importRegex, "").trim();

  return {
    imports,
    cleanedCode: cleaned,
  };
}

async function findMatchingExternalFile(rootDir, baseName, extension) {
  const files = await fsp.readdir(rootDir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(rootDir, file.name);

    if (file.isDirectory()) {
      const found = await findMatchingExternalFile(
        fullPath,
        baseName,
        extension,
      );
      if (found) return found;
    }

    if (file.isFile() && file.name === `${baseName}${extension}`) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Extracts the contents of the first <style> tag from the given HTML string.
 *
 * @param {string} html - The HTML string to search within.
 * @returns {RegExpMatchArray|null} The RegExp match array or null if not found.
 */
const styleRegex = (html) => html.match(/<style>([\s\S]*?)<\/style>/i);

/**
 * Extracts the contents of the first <content> tag from the given HTML string.
 *
 * @param {string} html - The HTML string to search within.
 * @returns {RegExpMatchArray|null} The RegExp match array or null if not found.
 */
const contentRegex = (html) => html.match(/<content>([\s\S]*?)<\/content>/i);

/**
 * Extracts the contents of the first <script> tag from the given HTML string.
 *
 * @param {string} html - The HTML string to search within.
 * @returns {RegExpMatchArray|null} The RegExp match array or null if not found.
 */
const scriptRegex = (html) => html.match(/<script>([\s\S]*?)<\/script>/i);

/** @type {(script: string) => string} */
const autoInjectValue = function (script) {
  const declarationRegex = /\b(?:let|const)\s+(\$\w+)/g;
  const usageRegex = /\B(\$\w+)\b/g;

  const declarationRanges = [];

  for (const match of script.matchAll(declarationRegex)) {
    const fullMatch = match[0];
    const varName = match[1];
    const start = match.index + fullMatch.indexOf(varName);
    const end = start + varName.length;
    declarationRanges.push([start, end]);
  }

  const stringRanges = [];
  const stringRegex = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g;

  for (const match of script.matchAll(stringRegex)) {
    stringRanges.push([match.index, match.index + match[0].length]);
  }

  const isInRanges = (start, end, ranges) =>
    ranges.some(([s, e]) => start >= s && end <= e);

  let result = "";
  let lastIndex = 0;

  for (const match of script.matchAll(usageRegex)) {
    const start = match.index;
    const end = start + match[1].length;
    const name = match[1];

    const inDeclaration = isInRanges(start, end, declarationRanges);
    const inExcluded = CONST.reservedNames.has(name);
    const inString = isInRanges(start, end, stringRanges);

    const isInTemplateExpr = (() => {
      const before = script.slice(Math.max(0, start - 2), start);
      const after = script.slice(end, end + 1);
      return before === "${" && after === "}";
    })();

    if (!inDeclaration && !inExcluded && (!inString || isInTemplateExpr)) {
      result += script.slice(lastIndex, start) + name + ".value";
      lastIndex = end;
    }
  }

  result += script.slice(lastIndex);
  return result;
};

/**
 * Transforms destructuring of the `state` object into individual state declarations.
 *
 * Example:
 * `const { count = init(0), name } = state;` becomes:
 * ```
 * const count = state("count", 0);
 * const name = state("name");
 * ```
 *
 * @param {string} fullScript - The original JavaScript code.
 * @returns {string} The transformed JavaScript code.
 */
const transformScript = (fullScript) => {
  const assignmentsRegex = CONST.regex.assignments;
  const declarationsRegex = CONST.regex.declarations;

  return autoInjectValue(fullScript)
    .replace(assignmentsRegex, (_, name, value) => {
      const trimmed = value.trim();

      const refCallMatch = CONST.regex.refCall.exec(trimmed);
      if (refCallMatch) {
        const inner = refCallMatch[1].trim();
        const hasValue = inner.length > 0;
        return `let $${name} = $state("${name}", ${hasValue ? inner : "undefined"}, true)`;
      }

      if (trimmed === "$ref") {
        return `let $${name} = $state("${name}", undefined, true)`;
      }

      return `let $${name} = $state("${name}", ${value})`;
    })
    .replace(declarationsRegex, (_, group) => {
      const variables = group
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.startsWith("$"));

      return variables
        .map((v) => {
          const name = v.slice(1);
          return `let $${name} = $state("${name}")`;
        })
        .join("\n");
    });
};

/**
 * Combines external and internal scripts, transforms them,
 * extracts imports, generates the final component module file,
 * and prepares the script to be injected into the runtime.
 *
 * @param {string} scriptJS - The inline script extracted from the `.pig.html` file.
 * @param {string} externalJS - The external `.pig.mjs` script content, if available.
 * @param {string} componentName - The name of the component (used for file generation).
 * @returns {Promise<void>} - The final script string ready to be injected at runtime.
 */
const generateComponentScript = async (scriptJS, externalJS, componentName) => {
  if (!scriptJS && !externalJS) return;

  const fullScript = [externalJS, scriptJS].filter(Boolean).join("\n\n");
  const transformedScript = transformScript(fullScript);

  const { imports, cleanedCode } = extractAndRemoveImports(transformedScript);

  await fsp.mkdir(resolvePath("@/builtScript"), {
    recursive: true,
  });
  const outputPath = resolvePath(`@/builtScript/${componentName}.mjs`);

  const scriptForFile = formatJS(`
  ${CONST.parserStrings.hardcodedImports}
  ${imports.join("\n")}
  ${CONST.parserStrings.exportBeforeScript}
  ${cleanedCode}\n}`);

  return fsp.writeFile(outputPath, scriptForFile);
};

/**
 * Injects transformed inner HTML content into a web component.
 * This includes:
 * - Injecting `host__element` attributes for `<render-if>` tags.
 * - Converting PascalCase component tags to kebab-case.
 * - Combining inline and external CSS styles.
 *
 * @param {string} html - Full original HTML string of the component.
 * @param {string} content - Content extracted from the `<content>` tag.
 * @param {string} componentName - The name of the component.
 * @param {string} externalCSS - Optional external CSS to include in the output.
 * @returns {string} The transformed innerHTML string, escaped and indented.
 */
const injectInnerHTMLToComponent = (
  html,
  content,
  componentName,
  externalCSS,
) => {
  let modifiedContent = content;

  const componentTags = extractComponentTagsFromString(html);

  componentTags.forEach((tag) => {
    const kebabTag = toKebabCase(tag);

    const selfClosingTagRegex = new RegExp(`<${tag}([^>]*)/>`, "g");
    modifiedContent = modifiedContent.replace(
      selfClosingTagRegex,
      `<${kebabTag}$1></${kebabTag}>`,
    );

    modifiedContent = modifiedContent.replace(
      new RegExp(`<${tag}([^>]*)>`, "g"),
      `<${kebabTag}$1>`,
    );
    modifiedContent = modifiedContent.replace(
      new RegExp(`</${tag}>`, "g"),
      `</${kebabTag}>`,
    );
  });

  const styleMatch = styleRegex(html);
  const styleCSS = [externalCSS, styleMatch ? styleMatch[1].trim() : ""]
    .filter(Boolean)
    .join("\n\n");

  return `
  <style>
   ${styleCSS}
   ${CONST.pageTransitionCss} 
  </style>
  
  ${modifiedContent}
  `;
};

/**
 * Orchestrates the full generation of a component file based on HTML, CSS, and JS inputs.
 * This includes transforming tags, escaping HTML, injecting scripts, and final assembly.
 *
 * @param {*} _ - Unused placeholder argument.
 * @param {...any} args - [componentName, html, content, externalCSS, externalJS]
 * @returns {Promise<string|undefined>} The final component file content, or undefined on error.
 */
const generateOutput = async (_, ...args) => {
  if (args.length !== 5) {
    console.msg("components.outputGenerationError", new Error());
  }

  const componentName = args[0];
  const html = args[1];
  const content = args[2];
  const externalCSS = args[3];
  const externalJS = args[4];

  const scriptMatch = scriptRegex(html);
  const scriptJS = scriptMatch ? scriptMatch[1].trim() : "";
  await generateComponentScript(scriptJS, externalJS, componentName);

  const innerHTML = formatHTML(
    injectInnerHTMLToComponent(
      html,
      content,
      componentName,
      externalCSS,
    ).trim(),
  );

  await fsp.mkdir(resolvePath("@/builtHTML"), {
    recursive: true,
  });
  const outputPath = resolvePath(`@/builtHTML/${componentName}.html`);
  await fsp.writeFile(outputPath, innerHTML);
  console.msg("components.generated", componentName);
};

/**
 * Extracts and returns the inner content of the <content> tag from the HTML string.
 *
 * @param {string} html - The HTML string to search.
 * @returns {string|undefined} The trimmed content inside the <content> tag, or undefined if not found.
 */
const getContentTag = (html) => {
  const contentMatch = contentRegex(html);

  if (!contentMatch) {
    return undefined;
  }
  return contentMatch[1].trim();
};

/**
 * Builds a web component from a .pig.html file.
 *
 * @param {string} filePath - Path to the component source file.
 */
async function buildComponent(filePath) {
  "use strict";

  try {
    const html = await fsp.readFile(filePath, "utf-8");
    const content = getContentTag(html);

    if (!content) {
      console.msg("components.missingContent", filePath);
    }

    const baseName = path.basename(filePath, ".pig.html");
    const componentName = toPascalCase(baseName);

    const externalCSSPath = await findMatchingExternalFile(
      resolvePath("@/src"),
      baseName,
      ".pig.css",
    );
    const externalJSPath = await findMatchingExternalFile(
      resolvePath("@/src"),
      baseName,
      ".pig.mjs",
    );

    let externalCSS = "";
    let externalJS = "";

    if (fs.existsSync(externalCSSPath)) {
      externalCSS = await fsp.readFile(externalCSSPath, "utf-8");
    }

    if (fs.existsSync(externalJSPath)) {
      externalJS = await fsp.readFile(externalJSPath, "utf-8");
    }

    await generateOutput`
    Component name: ${componentName}
    Component content: ${html}${content}
    External data: ${externalCSS}${externalJS}`;
  } catch (err) {
    if (err.message === "components.outputGenerationError") {
      console.msg(err.message, err);
    } else {
      console.msg("components.generationError", filePath, err);
    }
  }
}

/**
 * Extracts description objects from `<script content="description">` blocks.
 * Handles blocks with `export default { ... }` content.
 *
 * @param {string} filePath - Path to the `.pig.html` file to parse.
 * @returns {Promise<Object[]>} - Array of parsed description objects.
 */
async function extractDescriptionsFromFile(filePath) {
  try {
    const fileContent = await fsp.readFile(filePath, "utf-8");
    const descriptionMatches = [];
    const regex = /<script\s+content="description">([\s\S]*?)<\/script>/g;

    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      let raw = match[1].trim();

      // Remove "export default" and trailing semicolons or extra closing
      if (raw.startsWith("export default")) {
        raw = raw.replace(/^export\s+default\s+/, "").trim();
      }

      // Remove trailing semicolon if present
      if (raw.endsWith(";")) {
        raw = raw.slice(0, -1);
      }

      try {
        // Evaluate as JS object using `Function` constructor to avoid unsafe `eval`
        const descriptionData = new Function(`return ${raw}`)();
        descriptionMatches.push(descriptionData);
      } catch (e) {
        console.msg("components.errorParsingDescription", e);
      }
    }

    return descriptionMatches;
  } catch (err) {
    console.msg("components.errorReadingFile", err);
    return [];
  }
}

/**
 * Recursively processes all .pig.html files in a given directory.
 *
 * @param {string} [dir=resolvePath("@/components")] - Directory to scan.
 */
// Main function to process components and collect descriptions
async function processAllComponents(dir = resolvePath("@/components")) {
  const descriptions = [];
  try {
    const appPath = resolvePath("@/src/App.pig.html");
    const pagesDir = resolvePath("@/pages");

    // Process the App.pig.html file if it exists
    if (fs.existsSync(appPath) && Object.values(arguments).length === 0) {
      console.msg("components.generatingFrom", "App.pig.html");
      const appHtml = await fsp.readFile(appPath, "utf-8");
      parseRoutes(appHtml, pagesDir);
      for (const route of Object.values(routes)) {
        await buildComponent(route);
        const pageDescriptions = await extractDescriptionsFromFile(route);
        if (pageDescriptions.length === 0) {
          descriptions.push(CONST.defaultWebType(route));
        } else {
          descriptions.push(...pageDescriptions);
        }
      }
    }

    // Process the directory of components recursively
    const files = await fsp.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        // Recursively process directories and flatten the result
        const nestedDescriptions = await processAllComponents(filePath);
        descriptions.push(...nestedDescriptions); // Flatten the array
      } else if (file.name.endsWith(".pig.html")) {
        console.msg("components.generatingFrom", file.name);
        await buildComponent(filePath);

        // Extract descriptions from this component
        const componentDescriptions =
          await extractDescriptionsFromFile(filePath);

        if (componentDescriptions.length === 0) {
          descriptions.push(CONST.defaultWebType(filePath));
        } else {
          descriptions.push(...componentDescriptions);
        }
      }
    }
  } catch (err) {
    console.msg("components.processingError", err);
  }

  // Return the collected descriptions
  return descriptions;
}

export { buildComponent, processAllComponents };
