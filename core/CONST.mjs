import path from "path";
import { fileURLToPath } from "url";

const rootDirArg = process.argv.find((value) => value.startsWith("--rootDir="));

const rootDir = rootDirArg
  ? fileURLToPath(rootDirArg.replace("--rootDir=", ""))
  : process.cwd();

const PORT = 2137;

export default {
  PORT,
  directories: {
    "@": rootDir,
    components: path.resolve(rootDir, "src", "components"),
    builtComponents: path.resolve(rootDir, "build", "components"),
    pages: path.resolve(rootDir, "src", "pages"),
    public: path.resolve(rootDir, "src", "public"),
    corebrowserEnv: path.resolve(rootDir, "core", "browserEnv"),
  },
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
    component: "/component/",
    core: "/core/",
    module: "/module",
    api: "/api",
    public: "/public",
  },
  routes: ["component", "page", "file", "core", "module", "api"],
  consoleMessages: {
    server: {
      start: '🔧 Server is starting... Press "r" to reload components.',
      shuttingDown: "\n👋 Shutting down the server...",
      reloading: "\n🔁 Reloading all components...",
      regenerated: "✅ Components have been successfully regenerated.",
      regeneratingError: (err) => [
        "❌ Error while regenerating components:",
        err,
      ],
      restarting: "\n🔁 Restarting server...",
      restarted: "\n🔁 Server restarted",
      running: (port) =>
        `\n🚀 Server running at http://piglet.js:${port} if host exists and on http://localhost:${port}`,
      pressReload: '🔁 Press "r" to reload components.',
      pressRestart: '🔁 Press "s" to restart server.\n',
      initError: (err) => ["❌ Error during server initialization:", err],
      missingComponentName: "❌ Component name is missing",
      componentNotFound: "❌ Component not found",
      notFound: "Not found",
      error: (err) => err,
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
      generatingError: (err) => ["❌ Error while generating component:", err],
      changed: (filename) => `✅ File changed: ${filename}`,
      notFound: (componentName) =>
        `Component file for "${componentName}" not found.`,
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
        "❌ Failed to write to hosts file. Try running with elevated permissions.",
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
      structureCreated: "📦 Created structure only (minimal setup)",
      fullTemplateCreated: "📦 Created full template (structure + sample app)",
      missingTemplate: (template) =>
        `⚠️ Template directory for "${template}" does not exist.`,
      missingExtension: "⚠️ 'extension/' directory does not exist.",
      failedToAddHost:
        "⚠️ Failed to update hosts file. Try running this script as administrator.",
      addedToHosts: "✅ Successfully added piglet.js to hosts!",
      skipTemplate: "⚠️ Skipping template initialization.",
      noHostPermission:
        "🔧 You need admin privileges to add piglet.js to your hosts.",
    },
  },
};
