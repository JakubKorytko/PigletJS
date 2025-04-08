import http from "http";
import path from "path";
import fs from "fs";
import { generateAppHtml } from "@/server/libs/pageLoader";
import {
  processAllComponents,
  watchDirectory,
} from "@/server/libs/componentBuilder";
import CONST from "@/src/data/CONST";
import { resolvePath } from "../config/utils.mjs";

const server = http.createServer(async (req, res) => {
  "use strict";

  if (req.url.startsWith(CONST.customRouteAliases.component)) {
    const componentName = req.url.replace(
      CONST.customRouteAliases.component,
      "",
    );

    if (!componentName) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("❌ Component name is missing");
      return;
    }

    fs.readFile(
      resolvePath(`@/builtComponents/${componentName}.mjs`),
      (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("❌ Component not found");
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
          res.end("Not found");
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        }
      });
    }
  }
});

server.listen(CONST.PORT, async () => {
  if ([...process.argv].includes("--restart")) {
    console.log("\n🔁 Server restarted");
  } else {
    console.log(`\n🚀 Server running at http://localhost:${CONST.PORT}`);
    console.log('🔁 Press "r" to reload components.');
    console.log('🔁 Press "s" to restart server.\n');
  }

  try {
    await processAllComponents();
    watchDirectory();
  } catch (err) {
    console.error("❌ Error during server initialization:", err);
  }
});
