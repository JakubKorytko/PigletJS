import { resolvePath } from "@/utils/paths.mjs";
import path from "path";
import CONST from "@/src/CONST.mjs";
import fs from "fs";

export default (req, res) => {
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
};
