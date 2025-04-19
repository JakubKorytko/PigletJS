import { resolvePath } from "@/core/utils/paths.mjs";
import path from "path";
import CONST from "@/core/CONST.mjs";
import fs from "fs";

export default (req, res) => {
  const pathWithoutModule = req.url.replace("/module/", "");
  const filePath = resolvePath(`@/src/modules/${pathWithoutModule}.mjs`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/javascript";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(CONST.consoleMessages.server.notFound);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
};
