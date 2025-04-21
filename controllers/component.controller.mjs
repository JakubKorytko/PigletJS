import CONST from "@Piglet/CONST.mjs";
import fs from "fs";
import { resolvePath } from "@Piglet/utils/paths.mjs";
import notFound from "@Piglet/libs/notfound.mjs";

export default (req, res) => {
  const componentName = req.url.replace(CONST.customRouteAliases.component, "");

  if (!componentName) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(CONST.consoleMessages.server.missingComponentName);
    return;
  }

  fs.readFile(
    resolvePath(`@/builtComponents/${componentName}.mjs`),
    (err, data) => {
      if (err) {
        notFound(res);
      } else {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    },
  );
};
