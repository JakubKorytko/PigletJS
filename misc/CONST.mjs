// noinspection JSUnusedGlobalSymbols

import path from "path";
import { fileURLToPath } from "url";
import BROWSER_CONST from "../browser/CONST.mjs";

const rootDirArg = process.argv.find((value) => value.startsWith("--rootDir="));

const rootDir = rootDirArg
  ? fileURLToPath(rootDirArg.replace("--rootDir=", ""))
  : process.cwd();

const PORT = 2137;

const isProd = process.env.NODE_ENV === "production";

const dirPath = (isProd) => (isProd ? "piglet" : "PigletJS");

// noinspection HttpUrlsUsage
export default {
  PORT,
  dirPath,
  directories: {
    "@": rootDir,
    components: path.resolve(rootDir, "src", "components"),
    builtScript: path.resolve(rootDir, "build", "script"),
    builtHTML: path.resolve(rootDir, "build", "html"),
    builtLayouts: path.resolve(rootDir, "build", "layouts"),
    pages: path.resolve(rootDir, "src", "pages"),
    public: path.resolve(rootDir, "src", "public"),
    browser: path.resolve(rootDir, dirPath(isProd), "browser"),
  },
  voidTags: [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ],
  mimeTypes: {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".txt": "text/plain",
  },
  customRouteAliases: {
    component: "/component",
    piglet: "/Piglet",
    module: "/modules",
    api: "/api",
    public: "/public",
  },
  customRouteSubAliases: {
    component: {
      html: "/component/html",
      script: "/component/script",
      layout: "/component/layout",
    },
  },
  routes: ["component", "page", "file", "piglet", "module", "api"],
  consoleMessages: {
    server: {
      shuttingDown: "\n👋 Shutting down the server...",
      restarting: "\n🔁 Restarting server...",
      restarted: "\n🔁 Server restarted",
      running: (port) =>
        `🚀 Server running at http://piglet.js:${port} if host exists and on http://localhost:${port}`,
      pressReload: '🔁 Press "r" to reload components.',
      pressRestart: '🔁 Press "s" to restart server.\n',
      initError: (err) => ["❌ Error during server initialization:", err],
      missingComponentName: "❌ Component name is missing",
      controllerError: (err) => err,
    },
    consoleMsg: {
      invalidMessageType: (path) =>
        `⚠️ Message at "${path}" is neither a string nor a function.`,
      missingMessage: (path) => `⚠️ Message path "${path}" not found.`,
      invalidPath: "⚠️ No valid path provided.",
      evaluatingError: (path) =>
        `⚠️ Error while evaluating message function at "${path}"`,
    },
    components: {
      reloading: "\n🔁 Reloading all components...",
      regenerated: "✅ Components have been successfully regenerated.",
      regeneratingError: "❌ Error while regenerating components:",
      missingContent: (filePath) =>
        `❌ Missing <content> tag in file: ${filePath}`,
      generated: (outputPath) => outputPath,
      generatingFrom: (fileName) =>
        `⏳ Generating component from file: ${fileName}`,
      processingError: (err) => ["❌ Error while processing components:", err],
      outputGenerationError: (err) => [
        "❌ Error generating component, wrong number of arguments were passed to the output method",
        err,
      ],
      generationError: (filePath, err) => [
        `❌ Error generating component from file: ${filePath}`,
        err,
      ],
      watchingForChanges: (path) => path,
      directoryDoNotExist: (path) => `Directory ${path} does not exist`,
      generatingError: (err) => ["❌ Error while generating component:", err],
      changed: (filename) => `✅ File changed: ${filename}`,
      notFound: (componentName) =>
        `Component file for "${componentName}" not found.`,
      fullReloadTriggered: "✅ Sent full reload to socket clients",
    },
    pages: {
      failedToLoad: (pageName, err) => [
        `❌ Failed to load page: ${pageName}`,
        err,
      ],
      htmlGeneratingError: (err) => [
        `❌ Error generating HTML: ${err.message}`,
        err,
      ],
    },
    hosts: {
      addedToHosts: "✅ Added piglet.js to hosts!",
      failedToAddHost:
        "❌ Failed to write to hosts file. Try running with elevated permissions.\n",
      hostExists: "✔️ Hosts entry already exists.",
      couldntReadHostFile: (message) => [
        "❌ Could not read hosts file:",
        message,
      ],
      unsupportedOS: (platform) => ["❌ Unsupported OS:", platform],
      doYouWantToAdd:
        "🔧 Do you want to add piglet.js to your hosts file? (Requires admin privileges)",
      adding: "➕ Adding piglet.js to your hosts...",
    },
    template: {
      doYouWantExtension:
        "🧩 Do you want to include the browser extension for development tools?",
      copyExtension: "🧩 Copying browser extension...",
      skipExtension:
        "⚠️ Skipping browser extension: 'extension/' already exists.",
      copiedFile: (fileName) => `✅ Copied: ${fileName}`,
      skipExistingFile: (fileName) => `⚠️ Skipping existing file: ${fileName}`,
      createdFolder: (folder) => `📁 Created: ${folder}`,
      existsFolder: (folder) => `📁 Exists: ${folder}`,
      applyingTemplate: (template) => `🛠  Applying "${template}" template...`,
      skipTemplate: "⚠️ Skipping template initialization.",
      templatesRemoved: "🗑️ Removed 'Piglet/templates' directory.",
      templatesDoNotExists: "⚠️ 'Piglet/templates' directory does not exist.",
      extensionRemoved: "🗑️ Removed 'Piglet/extension' directory.",
      extensionDoNotExists: "⚠️ 'Piglet/extension' directory does not exist.",
      errorRemoving: (err) => ["❌ Error removing directories:", err],
      whichTemplate: "Which template do you want to use?\n",
      structureOnly: "🧱 Structure only (minimal setup)",
      exampleApp: "⭐ Full example (structure + sample app)",
      initialize: "📦 Do you want to initialize the project with a template?",
    },
    builder: {
      noPigletFolder: "❌ PigletJS folder not found.",
      skippingExistingFile: (file) =>
        `⚠️ File ${file} already exists — skipping.`,
      copiedFile: (file) => `✅ Copied ${file}`,
      promptExtras:
        "Do you want to copy additional files? (README, jsconfig, IDE config, .gitignore) (y/n): ",
      copiedProfile: (file) => `✅ Copied ${file}`,
      profileExists: (file) => `⚠️ File ${file} already exists — skipping.`,
      runningStart: "\nRunning start.mjs...\n",
      startExitCode: (code) => `❌ start.mjs exited with code: ${code}`,
      start: "🔧 Running build script...\n",
      errorParsingDescription: (err) => ["❌ Error parsing description:", err],
      errorReadingFile: (err) => ["❌ Error reading file:", err],
    },
    webTypes: {
      failedToLoad: (path, err) => [`❌ Failed to load ${path}:`, err.message],
      added: (addedCount) =>
        `✅ Added ${addedCount} custom element(s) into web-types.json`,
      failedToWrite: (path, err) => [
        `❌ Failed to write ${path}:`,
        err.message,
      ],
    },
    watcher: {
      errorInRunWatcher: (error) => ["❌ Error in runWatcher:", error],
      errorInCreateSubprocess: (error) => [
        "❌ Error in createSubprocess:",
        error,
      ],
      entryFileNotFound: (path) => ["❌ Entry file not found:", path],
      pleaseCreateEntryFile: (path) => [
        "💡 Please create '@/server/index.mjs' before running the process.\n",
        path,
      ],
    },
  },
  browser: BROWSER_CONST,
  productionExclude: {
    dirs: new Set([
      ".git",
      ".idea",
      "@jsdocs",
      "@types",
      "docs",
      "extension",
      "templates",
    ]),
    files: new Set([
      ".gitignore",
      "jsconfig.json",
      "LICENSE",
      "package.json",
      "README.md",
      "tsconfig.json",
      "typedoc.config.js",
      "web-types.json",
      "start.mjs",
      "setup.mjs",
    ]),
  },
  parserStrings: {
    exportBeforeScript: (isAsync) => `
      export default ${isAsync ? "async" : ""} function({
      $attrs,
      $onBeforeUpdate,
      $onAfterUpdate,
      $element,
      $elements,
      $reason,
      $,
      $P,
      $B,
      $$,
      $$P,
      $this,
      $document,
      out,
    }) {
    `,
  },
  defaultWebType: (fileName) => ({
    name: path.basename(fileName, ".pig.html"),
    description: "No description found",
    attributes: [
      {
        name: "fragment",
        description:
          "Indicates that the component should be rendered as a fragment.",
        value: {
          type: "boolean",
        },
        default: "false",
      },
    ],
  }),
  wizardSteps: [
    {
      type: "multi",
      name: "files",
      prompt:
        "Select config files to copy (not required for app to run, git/IDE related):",
      options: [
        {
          label: "jsconfig.json",
          description:
            "If skipped, consider adding @Piglet/* -> ./piglet/* path to your ts/jsconfig",
          checked: true,
        },
        {
          label: "package.json",
          description:
            'Can be skipped, the only important thing is setting "web-types" to "./web-types.json" in your package.json',
          checked: true,
        },
        {
          label: ".gitignore",
          description:
            'Can be skipped if "build" is already in your .gitignore',
          checked: true,
        },
      ],
    },
    {
      type: "single",
      name: "template",
      prompt: "Which template do you want to use?:",
      options: [
        "Showcase example app",
        "Directories structure only",
        "No template at all",
      ],
    },
    {
      type: "multi",
      name: "additional",
      prompt: "Additional options:",
      options: [
        {
          label: "Copy extension to project root",
          description:
            "When added to your browser, it allows inspecting components tree & state + changing the state in real time",
        },
        {
          label: "Add piglet.js to hosts file",
          description:
            "Allows you to access the website using http://piglet.js:PORT instead of localhost (requires admin privileges)",
        },
      ],
    },
  ],
  consoleCodes: {
    colorReset: "\x1b[0m",
    colors: {
      blue: "\x1b[34m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      gray: "\x1b[90m",
      bold: "\x1b[1m",
      orange: "\x1b[38;5;208m",
      black: "\x1b[30m",
      cyan: "\x1b[36m",
      magenta: "\x1b[35m",
      red: "\x1b[31m",
      white: "\x1b[37m",
    },
    bgColors: {
      orange: "\x1b[48;5;208m",
      green: "\x1b[48;5;34m",
      inverse: "\x1b[7m",
    },
    hideCursor: "\x1B[?25l",
    showCursor: "\x1B[?25h",
    clearScreen: "\x1Bc",
    ctrlC: "\u0003",
    esc: "\u001B",
    arrowUp: "\u001B\u005B\u0041",
    arrowDown: "\u001B\u005B\u0042",
    arrowRight: "\u001B\u005B\u0043",
    arrowLeft: "\u001B\u005B\u0044",
  },
  wizardFilesToCopy: {
    prod: [
      { src: "piglet.mjs", target: "pig.mjs" },
      { src: ".gitignore" },
      { src: "package.json" },
      {
        src: path.join("builder", "app_jsconfig.json"),
        target: "jsconfig.json",
      },
    ],
    dev: [
      { src: "README.md" },
      { src: ".gitignore" },
      { src: "package.json" },
      { src: "start.mjs" },
      {
        src: path.join("builder", "app_jsconfig.json"),
        target: "jsconfig.json",
      },
    ],
  },
};
