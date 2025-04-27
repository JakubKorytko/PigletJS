// noinspection JSUnusedGlobalSymbols

import path from "path";
import { fileURLToPath } from "url";

const rootDirArg = process.argv.find((value) => value.startsWith("--rootDir="));

const rootDir = rootDirArg
  ? fileURLToPath(rootDirArg.replace("--rootDir=", ""))
  : process.cwd();

const PORT = 2137;

// noinspection HttpUrlsUsage
export default {
  PORT,
  directories: {
    "@": rootDir,
    components: path.resolve(rootDir, "src", "components"),
    builtComponents: path.resolve(rootDir, "build", "components"),
    builtScript: path.resolve(rootDir, "build", "script"),
    builtHTML: path.resolve(rootDir, "build", "html"),
    pages: path.resolve(rootDir, "src", "pages"),
    public: path.resolve(rootDir, "src", "public"),
    browser: path.resolve(rootDir, "PigletJS", "browser"),
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
    module: "/module",
    api: "/api",
    public: "/public",
  },
  customRouteSubAliases: {
    component: {
      html: "/component/html",
      script: "/component/script",
    },
  },
  routes: ["component", "page", "file", "piglet", "module", "api"],
  consoleMessages: {
    server: {
      shuttingDown: "\n👋 Shutting down the server...",
      restarting: "\n🔁 Restarting server...",
      restarted: "\n🔁 Server restarted",
      running: (port) =>
        `\n🚀 Server running at http://piglet.js:${port} if host exists and on http://localhost:${port}`,
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
      generated: (outputPath) => `✅ Component generated: ${outputPath}`,
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
      watchingForChanges: (path) =>
        `👀 Watching for changes in directory: ${path}`,
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
    },
  },
};
