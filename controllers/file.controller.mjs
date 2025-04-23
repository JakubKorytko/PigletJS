import { resolvePath } from "@Piglet/utils/paths";
import path from "path";
import CONST from "@Piglet/misc/CONST";
import fs from "fs";
import notFound from "@Piglet/libs/notfound";

export default (req, res) => {
  if (!req.url.startsWith(CONST.customRouteAliases.public)) {
    // noinspection JSIgnoredPromiseFromCall
    notFound(res);
    return;
  }
  const filePath = resolvePath(`@${req.url}`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // noinspection JSIgnoredPromiseFromCall
      notFound(res);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
};
