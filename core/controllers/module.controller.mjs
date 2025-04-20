import { resolvePath } from "@/core/utils/paths.mjs";
import path from "path";
import CONST from "@/core/CONST.mjs";
import fs from "fs";
import notFound from "@/core/libs/notfound.mjs";

export default (req, res) => {
  const pathWithoutModule = req.url.replace("/module/", "");
  const filePath = resolvePath(`@/src/modules/${pathWithoutModule}.mjs`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/javascript";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      notFound(res);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
};
