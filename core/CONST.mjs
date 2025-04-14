import path from "path";
import { fileURLToPath } from "url";

const rootDirArg = process.argv.find((value) => value.startsWith("--rootDir="));

const rootDir = rootDirArg
  ? fileURLToPath(rootDirArg.replace("--rootDir=", ""))
  : process.cwd();

const PORT = 3000;

export default {
  PORT,
  directories: {
    "@": rootDir,
    components: path.resolve(rootDir, "src", "components"),
    builtComponents: path.resolve(rootDir, "build", "components"),
    pages: path.resolve(rootDir, "src", "pages"),
    public: path.resolve(rootDir, "src", "public"),
    coreBrowserLogic: path.resolve(rootDir, "core", "browserLogic"),
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
  },
  routes: ["component", "page", "file", "core"],
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
      running: (port) => `\n🚀 Server running at http://localhost:${port}`,
      pressReload: '🔁 Press "r" to reload components.',
      pressRestart: '🔁 Press "s" to restart server.\n',
      initError: (err) => ["❌ Error during server initialization:", err],
      missingComponentName: "❌ Component name is missing",
      componentNotFound: "❌ Component not found",
      notFound: "Not found",
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
  },
};
