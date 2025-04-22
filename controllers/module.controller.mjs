import { resolvePath } from "@Piglet/utils/paths.mjs";
import path from "path";
import CONST from "@Piglet/CONST.mjs";
import fs from "fs";
import notFound from "@Piglet/libs/notfound.mjs";

export default (req, res) => {
  const pathWithoutModule = req.url.replace("/module/", "");
  const filePath = resolvePath(`@/src/modules/${pathWithoutModule}.mjs`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/javascript";

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
