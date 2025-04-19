import { resolvePath } from "@/core/utils/paths.mjs";
import path from "path";
import CONST from "@/core/CONST.mjs";
import fs from "fs";
import { routeAliases } from "@/core/libs/routes.mjs";

export default (req, res) => {
  const pathWithoutCore = req.url.replace("/core/", "");
  const filePath = resolvePath(`@/corebrowserEnv/${pathWithoutCore}.mjs`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/javascript";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(CONST.consoleMessages.server.notFound);
    } else {
      let code = data.toString();

      // Replace core imports
      code = code
        .replace(/(["'])@\/core\/browserEnv\//g, "$1/core/")
        .replace(/["@']@\/modules\//g, '"/module/');

      // Inject routes into root.mjs
      const routesInjection = `const routes = ${JSON.stringify(routeAliases)};\n`;

      // Inject routes at the beginning of the code
      code = routesInjection + code;

      res.writeHead(200, { "Content-Type": contentType });
      res.end(code);
    }
  });
};
