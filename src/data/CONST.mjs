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
    src: path.resolve(rootDir, "src"),
    components: path.resolve(rootDir, "src/components"),
    build: path.resolve(rootDir, "build"),
    builtComponents: path.resolve(rootDir, "build", "components"),
    public: path.resolve(rootDir, "public"),
    pages: path.resolve(rootDir, "src/pages"),
    server: path.resolve(rootDir, "server"),
    config: path.resolve(rootDir, "config"),
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
  },
};
