import { resolvePath } from "@Piglet/utils/paths";
import path from "path";
import CONST from "@Piglet/misc/CONST";
import fs from "fs";
import notFound from "@Piglet/libs/notfound";
import { convertSelectorsPascalToSnake } from "@Piglet/libs/helpers";

export default (req, res) => {
  if (!req.url.startsWith(CONST.customRouteAliases.public)) {
    // noinspection JSIgnoredPromiseFromCall
    notFound(res);
    return;
  }
  const filePath = resolvePath(`@${req.url.split("?")[0]}`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // noinspection JSIgnoredPromiseFromCall
      notFound(res);
    } else {
      let result = data;
      if (
        contentType === CONST.mimeTypes[".css"] &&
        filePath.endsWith("pig.css")
      ) {
        result = convertSelectorsPascalToSnake(data.toString());
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(result);
    }
  });
};
