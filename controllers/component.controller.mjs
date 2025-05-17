import CONST from "@Piglet/misc/CONST";
import fs from "fs";
import { resolvePath } from "@Piglet/utils/paths";

export default (req, res) => {
  const componentName = req.url
    .split("?")[0]
    .replace(CONST.customRouteSubAliases.component.html, "")
    .replace(CONST.customRouteSubAliases.component.script, "")
    .replace(CONST.customRouteAliases.component, "");
  let filePath;

  if (req.url.startsWith(CONST.customRouteSubAliases.component.html)) {
    filePath = resolvePath(`@/builtHTML/${componentName}.html`);
  } else if (req.url.startsWith(CONST.customRouteSubAliases.component.script)) {
    filePath = resolvePath(`@/builtScript/${componentName}.mjs`);
  }

  if (!componentName) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(CONST.consoleMessages.server.missingComponentName);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(CONST.browser.componentNotFound);
    } else {
      const ext = filePath.split(".").pop();
      let contentType = "text/plain";

      if (ext === "html") {
        contentType = "text/html";
      } else if (ext === "mjs" || ext === "js") {
        contentType = "application/javascript";
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
};
