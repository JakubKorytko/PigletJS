import CONST from "@/core/CONST.mjs";
import fs from "fs";
import { resolvePath } from "@/core/utils/paths.mjs";

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
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(CONST.consoleMessages.server.componentNotFound);
      } else {
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(data);
      }
    },
  );
};
