import fs from "fs";
import path from "path";
import { resolvePath } from "@/core/utils/paths.mjs";
import {
  indent,
  toKebabCase,
  toPascalCase,
} from "@/core/utils/stringUtils.mjs";
import { parseRoutes, routes } from "@/core/libs/routes.mjs";

function extractAndRemoveImports(code) {
  const importRegex = /^import\s+[\s\S]*?["'][^"']+["'];?/gm;
  const imports = [];
  let cleaned = code;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    let importStatement = match[0];

    importStatement = importStatement
      .replace(/["@']@\/core\/browserLogic\//g, '"/core/')
      .replace(/["@']@\/modules\//g, '"/module/');

    imports.push(importStatement);
  }

  cleaned = code.replace(importRegex, "").trim();

  return {
    imports,
    cleanedCode: cleaned,
  };
}

async function findMatchingExternalFile(rootDir, baseName, extension) {
  const files = await fs.promises.readdir(rootDir, { withFileTypes: true });

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

const styleRegex = (html) => html.match(/<style>([\s\S]*?)<\/style>/i);
const contentRegex = (html) => html.match(/<content>([\s\S]*?)<\/content>/i);
const scriptRegex = (html) => html.match(/<script>([\s\S]*?)<\/script>/i);
function escapeTemplateLiteral(str) {
  return str
    .replace(/\\/g, "\\\\") // backslash → podwójny backslash
    .replace(/`/g, "\\`") // backtick → escaped backtick
    .replace(/\$\{/g, "\\${"); // interpolacje → literalna forma
}

function injectHostElementAttribute(content, tagName, componentName) {
  const regex = new RegExp(`<${tagName}([^>]*)>`, "g");

  return content.replace(regex, (match, attrs) => {
    if (/host__element\s*=/.test(attrs)) return match;
    return `<${tagName} host__element="${componentName}_NOT_SETTLED"${attrs}>`;
  });
}

const injectScriptToComponent = (scriptJS, externalJS) => {
  if (!scriptJS && !externalJS) return "";

  const destructureRegex = /const\s*{\s*([^}]+?)\s*}\s*=\s*state\s*;/g;

  const fullScript = [externalJS, scriptJS].filter(Boolean).join("\n\n");
  // Replace it with multiple `const x = state("x");`
  const transformedScript = fullScript.replace(destructureRegex, (_, vars) => {
    return vars
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => `const ${v} = state("${v}");`)
      .join("\n");
  });

  const { imports, cleanedCode } = extractAndRemoveImports(transformedScript);

  return [
    `runScript(shadowRoot) {
        (function(shadowRoot, hostElement) {
          const element = (selector) => {
    const el = hostElement.shadowRoot.querySelector(selector);
    return {
      on: (event, callback) => {
        el?.addEventListener(event, callback);
        return element(selector);
      },
      off: (event, callback) => {
        el?.removeEventListener(event, callback);
        return element(selector);
      },
    };
  };

        const component = {
          name: hostElement.constructor.name,
          id: hostElement.__componentId,
          tree: hostElement._tree,
          shadowRoot: hostElement.shadowRoot,
          key: hostElement.__componentKey,
          state: hostElement.state.bind(hostElement),
        }
        let onStateChange;
        const {state} = component; 
        
        ${cleanedCode}
        hostElement.onStateChange = onStateChange;
        onStateChange = undefined;
        })(shadowRoot, this);
      }`,
    imports,
  ];
};

const injectInnerHTMLToComponent = (
  html,
  content,
  componentName,
  externalCSS,
) => {
  let modifiedContent = injectHostElementAttribute(
    content,
    "c-if",
    componentName,
  );

  const componentTags = new Set(["App"]);
  const tagRegex =
    /<([A-Z][a-zA-Z0-9]*)[^>]*>.*?<\/\1>|<([A-Z][a-zA-Z0-9]*)[^>]*\/>/g;
  let match;

  while ((match = tagRegex.exec(modifiedContent)) !== null) {
    const pascalTag = match[1] || match[2];
    componentTags.add(pascalTag);
  }

  componentTags.forEach((tag) => {
    const kebabTag = tag === "App" ? "app-root" : toKebabCase(tag);

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

  const innerHTML = `
  <style>
  ${styleCSS}
  </style>
  
  ${modifiedContent}
  `;

  return `\`${indent(escapeTemplateLiteral(innerHTML), 8)}\``;
};

const generateOutput = (_, ...args) => {
  if (args.length !== 5) {
    throw Error("components.outputGenerationError");
  }

  const componentName = args[0];
  const html = args[1];
  const content = args[2];
  const externalCSS = args[3];
  const externalJS = args[4];

  const isAppComponent = componentName === "App";
  const className = isAppComponent ? "AppRoot" : componentName;
  const tagName = isAppComponent ? "app-root" : toKebabCase(componentName);

  const scriptMatch = scriptRegex(html);
  const scriptJS = scriptMatch ? scriptMatch[1].trim() : "";
  const fullScript = injectScriptToComponent(scriptJS, externalJS);

  return `
  import ReactiveComponent from "/core/reactiveComponent";
  import { injectTreeTrackingToComponentClass } from "/core/treeTracking";
  ${fullScript ? fullScript[1].join("\n") : ""}
class ${className} extends ReactiveComponent {
 
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = ${injectInnerHTMLToComponent(html, content, componentName, externalCSS)};
        const componentKey = \`\${this.constructor.name}\${this.__componentId ?? __globalComponentCounter+1}\`

        ${scriptJS ? `this.runScript(shadow);` : ""}
      }

      ${fullScript[0]}
    }

injectTreeTrackingToComponentClass(${className});
customElements.define('${tagName}', ${className});
export default ${componentName};
`.trim();
};

const getContentTag = (html) => {
  const contentMatch = contentRegex(html);

  if (!contentMatch) {
    return;
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
    const html = await fs.promises.readFile(filePath, "utf-8");
    const content = getContentTag(html);

    if (!content) {
      console.msg("components.missingContent", filePath);
    }

    const baseName = path.basename(filePath, ".pig.html");
    const componentName = toPascalCase(baseName);

    // Szukamy plików .pig.css i .pig.mjs
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
      externalCSS = await fs.promises.readFile(externalCSSPath, "utf-8");
    }

    if (fs.existsSync(externalJSPath)) {
      externalJS = await fs.promises.readFile(externalJSPath, "utf-8");
    }

    // Generowanie wynikowego kodu komponentu
    const output = generateOutput`
    Component name: ${componentName}
    Component content: ${html}${content}
    External data: ${externalCSS}${externalJS}`;

    await fs.promises.mkdir(resolvePath("@/builtComponents"), {
      recursive: true,
    });
    const outputPath = resolvePath(`@/builtComponents/${componentName}.mjs`);
    await fs.promises.writeFile(outputPath, output);
    console.msg("components.generated", outputPath);
  } catch (err) {
    if (err.message === "components.outputGenerationError") {
      console.msg(err.message, err);
    } else {
      console.msg("components.generationError", filePath, err);
    }
  }
}

/**
 * Recursively processes all .pig.html files in a given directory.
 *
 * @param {string} [dir=resolvePath("@/components")] - Directory to scan.
 */
async function processAllComponents(dir = resolvePath("@/components")) {
  try {
    const appPath = resolvePath("@/src/App.pig.html");
    const pagesDir = resolvePath("@/pages");
    if (fs.existsSync(appPath)) {
      console.msg("components.generatingFrom", "App.pig.html");
      const appHtml = await fs.promises.readFile(appPath, "utf-8");
      parseRoutes(appHtml, pagesDir);
      for (const route of Object.values(routes)) {
        await buildComponent(route);
      }
    }

    const files = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await processAllComponents(filePath);
      } else if (file.name.endsWith(".pig.html")) {
        console.msg("components.generatingFrom", file.name);
        await buildComponent(filePath);
      }
    }
  } catch (err) {
    console.msg("components.processingError", err);
  }
}

export { buildComponent, processAllComponents };
