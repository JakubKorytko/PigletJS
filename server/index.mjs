import http from "http";
import path from "path";
import fs from "fs";
import { generateAppHtml } from "@/server/pageLoader.mjs";
import { processAllComponents } from "@/server/componentBuilder.mjs";
import CONST from "@/src/CONST.mjs";
import { resolvePath } from "@/src/utils/paths.mjs";
import { watchDirectory } from "@/watcher/methods.mjs";
import "@/src/utils/console.mjs";

const server = http.createServer(async (req, res) => {
  "use strict";

  if (req.url.startsWith(CONST.customRouteAliases.component)) {
    const componentName = req.url.replace(
      CONST.customRouteAliases.component,
      "",
    );

    if (!componentName) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(CONST.consoleMessages.server.missingComponentName);
      return;
    }

    fs.readFile(
      resolvePath(`@/builtComponents/${componentName}.mjs`),
      (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end(CONST.consoleMessages.server.componentNotFound);
        } else {
          res.writeHead(200, { "Content-Type": "application/javascript" });
          res.end(data);
        }
      },
    );
  } else {
    const pageName = req.url.replace("/", "") || "home";
    let htmlContent = await generateAppHtml(pageName);

    if (htmlContent) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    } else {
      const filePath = resolvePath(`@/public/${req.url}`);
      const ext = path.extname(filePath);
      const contentType = CONST.mimeTypes[ext] || "application/octet-stream";

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end(CONST.consoleMessages.server.notFound);
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        }
      });
    }
  }
});

server.listen(CONST.PORT, async () => {
  if (process.argv.includes("--restart")) {
    console.msg("server.restarted");
  } else {
    console.msg("server.running", CONST.PORT);
    console.msg("server.pressReload");
    console.msg("server.pressRestart");
  }

  try {
    await processAllComponents();
    watchDirectory();
  } catch (err) {
    console.msg("server.initError", err);
  }
});
