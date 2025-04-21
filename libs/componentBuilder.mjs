import fs from "fs";
import path from "path";
import { resolvePath } from "@Piglet/utils/paths.mjs";
import {
  indent,
  toKebabCase,
  toPascalCase,
} from "@Piglet/utils/stringUtils.mjs";
import { parseRoutes, routes } from "@Piglet/libs/routes.mjs";

function extractAndRemoveImports(code) {
  const importRegex = /^import\s+[\s\S]*?["'][^"']+["'];?/gm;
  const imports = [];
  let cleaned = code;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    let importStatement = match[0];

    importStatement = importStatement
      .replace(/["@']@Piglet\/browserEnv\//g, '"/Piglet/')
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
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function injectHostElementAttribute(content, tagName, componentName) {
  const regex = new RegExp(`<${tagName}([^>]*)>`, "g");

  return content.replace(regex, (match, attrs) => {
    if (/host__element\s*=/.test(attrs)) return match;
    return `<${tagName} host__element="${componentName}_NOT_SETTLED"${attrs}>`;
  });
}

const transformScript = (fullScript) => {
  const destructureRegex = /const\s*{\s*(.*?)\s*}\s*=\s*state\s*;/g;

  return fullScript.replace(destructureRegex, (_, vars) => {
    return vars
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        const [namePart, defaultPart] = v.split("=").map((s) => s.trim());
        const name = namePart.replace(/[{}]/g, "").trim();

        let secondArg = "";

        if (defaultPart) {
          const initMatch = defaultPart.match(/^init\((.*)\)$/);

          if (initMatch) {
            secondArg = `, ${initMatch[1]}`;
          }
        }

        return `const ${name} = state("${name}"${secondArg});`;
      })
      .join("\n");
  });
};

const injectScriptToComponent = (scriptJS, externalJS) => {
  if (!scriptJS && !externalJS) return "";

  const fullScript = [externalJS, scriptJS].filter(Boolean).join("\n\n");
  const transformedScript = transformScript(fullScript);

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
    pass: (attrName, value) => {
      if (el && typeof value === "function") {
         if (!el._forwarded) {
          el._forwarded = {};
         }
         el._forwarded[attrName] = value;
         if (el.onAttributeChange) el.onAttributeChange("forwarded", el._forwarded);
         if (el.reactive) el.reactive();
      } else {
         el?.setAttribute(attrName, value);
      }
      return element(selector);
    },
    get ref() {
      return el;
    }
  };
};

const stateHandlers = {};
   
let onStateChange = new Proxy(
  (value, property, prevValue) => {
    const handler = stateHandlers[property];
    if (typeof handler === 'function') {
      handler(value, prevValue);
    }
  },
  {
    get(target, prop) {
      return stateHandlers[prop];
    },
    set(target, prop, value) {
      if (typeof value === 'function') {
        stateHandlers[prop] = value;
        return true;
      }
      return false;
    }
  }
);
const attributeHandlers = {};

let onAttributeChange = new Proxy(
  (newValue, property, prevValue) => {
    const handler = attributeHandlers[property];
    if (typeof handler === 'function') {
      handler(newValue, prevValue);
    }
  },
  {
    get(target, prop) {
      return attributeHandlers[prop];
    },
    set(target, prop, value) {
      if (typeof value === 'function') {
        attributeHandlers[prop] = value;
        return true;
      }
      return false;
    }
  }
);
        let reactive = () => {};
        let onUpdate = (callback) => {
          reactive = callback;
        };

        const state =  hostElement.state.bind(hostElement); 
        const attributes = hostElement._attrs;
        const forwarded = hostElement._forwarded;
        const onConnect = getComponentDataMethod(hostElement);
        ${cleanedCode}
        hostElement.reactive = reactive;
        hostElement.onStateChange = onStateChange;
        hostElement.onAttributeChange = onAttributeChange;
        reactive();
        onStateChange = undefined;
        onAttributeChange = undefined;
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
    console.msg("components.outputGenerationError", new Error());
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
  import ReactiveComponent from "/Piglet/reactiveComponent";
  import { injectTreeTrackingToComponentClass } from "/Piglet/treeTracking";
  import { getComponentDataMethod, api } from "/Piglet/helpers";
  ${fullScript ? fullScript[1].join("\n") : ""}
class ${className} extends ReactiveComponent {
 
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = ${injectInnerHTMLToComponent(html, content, componentName, externalCSS)};
        const componentKey = \`\${this.constructor.name}\${this.__componentId ?? window.Piglet.componentCounter+1}\`

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
