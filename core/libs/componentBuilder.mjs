import fs from "fs";
import path from "path";
import { resolvePath } from "@/core/utils/paths.mjs";
import {
  toPascalCase,
  toKebabCase,
  indent,
} from "@/core/utils/stringUtils.mjs";

/**
 * Builds a web component from a .cc.html file.
 *
 * @param {string} filePath - Path to the component source file.
 */
async function buildComponent(filePath) {
  "use strict";

  try {
    const html = await fs.promises.readFile(filePath, "utf-8");
    const contentMatch = html.match(/<content>([\s\S]*?)<\/content>/i);

    if (!contentMatch) {
      console.msg("components.missingContent", filePath);
      return;
    }

    const baseName = path.basename(filePath, ".cc.html");
    const componentName = toPascalCase(baseName);
    const tagName = toKebabCase(componentName);

    const content = contentMatch[1].trim();

    const modifiedContent = content.replace(
      /<c-if([^>]*)>/g,
      (match, attrs) => {
        if (/host__element\s*=/.test(attrs)) return match;
        return `<c-if host__element="${componentName}"${attrs}>`;
      },
    );

    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
    const styleCSS = styleMatch ? styleMatch[1].trim() : "";

    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
    const scriptJS = scriptMatch ? scriptMatch[1].trim() : "";

    const output = `
class ${componentName} extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = \`
          <style>
${indent(styleCSS, 12)}
          </style>
${indent(modifiedContent, 8)}
        \`;

        ${scriptJS ? `this.runScript(shadow);` : ""}
      }

      ${
        scriptJS
          ? `runScript(shadowRoot) {
        (function(shadowRoot, hostElement) {
        const _componentName = hostElement.constructor.name; 
${indent(scriptJS, 8)}
        })(shadowRoot, this);
      }`
          : ""
      }
    }
customElements.define('${tagName}', ${componentName});
`.trim();

    await fs.promises.mkdir(resolvePath("@/builtComponents"), {
      recursive: true,
    });

    const outputPath = resolvePath(`@/builtComponents/${componentName}.mjs`);
    await fs.promises.writeFile(outputPath, output);
    console.msg("components.generated", outputPath);
  } catch (err) {
    console.msg("components.generationError", filePath, err);
  }
}

/**
 * Recursively processes all .cc.html files in a given directory.
 *
 * @param {string} [dir=resolvePath("@/components")] - Directory to scan.
 */
async function processAllComponents(dir = resolvePath("@/components")) {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await processAllComponents(filePath);
      } else if (file.name.endsWith(".cc.html")) {
        console.msg("components.generatingFrom", file.name);
        await buildComponent(filePath);
      }
    }
  } catch (err) {
    console.msg("components.processingError", err);
  }
}

export { buildComponent, processAllComponents };
