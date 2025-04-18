import fs from "fs";
import path from "path";
import { resolvePath } from "@/core/utils/paths.mjs";
import {
  indent,
  toKebabCase,
  toPascalCase,
} from "@/core/utils/stringUtils.mjs";

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

const injectScriptToComponent = (scriptJS) => {
  if (!scriptJS) return "";

  return `runScript(shadowRoot) {
        (function(shadowRoot, hostElement) {
        const component = {
          name: hostElement.constructor.name,
          id: hostElement.__componentId,
          tree: hostElement.customElementTree,
          shadowRoot: hostElement.shadowRoot,
          key: hostElement.__componentKey,
          state: hostElement.state.bind(hostElement),
        }
        let onStateChange;
        const {state} = component; 
        ${scriptJS}
        hostElement.onStateChange = onStateChange;
        onStateChange = undefined;
        })(shadowRoot, this);
      }`;
};

const injectInnerHTMLToComponent = (html, content, componentName) => {
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
  const styleCSS = styleMatch ? styleMatch[1].trim() : "";

  const innerHTML = `
  <style>
  ${styleCSS}
  </style>
  
  ${modifiedContent}
  `;

  return `\`${indent(escapeTemplateLiteral(innerHTML), 8)}\``;
};

const generateOutput = (_, ...args) => {
  if (args.length !== 3) {
    throw Error("components.outputGenerationError");
  }

  const componentName = args[0];
  const html = args[1];
  const content = args[2];

  const isAppComponent = componentName === "App";
  const className = isAppComponent ? "AppRoot" : componentName;
  const tagName = isAppComponent ? "app-root" : toKebabCase(componentName);

  const scriptMatch = scriptRegex(html);
  const scriptJS = scriptMatch ? scriptMatch[1].trim() : "";

  return `
class ${className} extends ReactiveComponent {
 
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = ${injectInnerHTMLToComponent(html, content, componentName)};
        const componentKey = \`\${this.constructor.name}\${this.__componentId ?? __globalComponentCounter+1}\`

        ${scriptJS ? `this.runScript(shadow);` : ""}
      }

      ${injectScriptToComponent(scriptJS)}
    }

injectTreeTrackingToComponentClass(${className});
customElements.define('${tagName}', ${className});
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
 * Builds a web component from a .cc.html file.
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

    const baseName = path.basename(filePath, ".cc.html");
    const componentName = toPascalCase(baseName);

    const output = generateOutput`
    Component name: ${componentName}
    Component content: ${html}${content}`;

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
 * Recursively processes all .cc.html files in a given directory.
 *
 * @param {string} [dir=resolvePath("@/components")] - Directory to scan.
 */
async function processAllComponents(dir = resolvePath("@/components")) {
  try {
    const appPath = resolvePath("@/src/App.cc.html");
    if (fs.existsSync(appPath)) {
      console.msg("components.generatingFrom", "App.cc.html");
      await buildComponent(appPath);
    }

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
