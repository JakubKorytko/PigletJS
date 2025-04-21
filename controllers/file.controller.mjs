import { resolvePath } from "@Piglet/utils/paths.mjs";
import path from "path";
import CONST from "@Piglet/CONST.mjs";
import fs from "fs";
import notFound from "@Piglet/libs/notfound.mjs";

export default (req, res) => {
  if (!req.url.startsWith(CONST.customRouteAliases.public)) {
    notFound(res);
    return;
  }
  const filePath = resolvePath(`@${req.url}`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      notFound(res);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
};
