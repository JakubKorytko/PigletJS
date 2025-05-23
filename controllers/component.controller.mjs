import CONST from "@Piglet/misc/CONST";
import fs from "fs";
import { resolvePath } from "@Piglet/utils/paths";
import { getLayoutFilePath, getPaths } from "@Piglet/libs/helpers";

export default (req, res) => {
  const { html, script, layout } = CONST.customRouteSubAliases.component;
  const { component } = CONST.customRouteAliases;
  const replaceRegex = new RegExp(
    `${html}|${script}|${layout}|${component}|/`,
    "g",
  );

  const componentName = req.url.split("?")[0].replace(replaceRegex, "");

  if (componentName === "paths") {
    const paths = getPaths();
    if (paths) {
      res.end(paths);
      return;
    }
  }

  let filePath;

  if (req.url.startsWith(html)) {
    filePath = resolvePath(`@/builtHTML/${componentName}.html`);
  } else if (req.url.startsWith(script)) {
    filePath = resolvePath(`@/builtScript/${componentName}.mjs`);
  } else if (req.url.startsWith(layout)) {
    filePath = getLayoutFilePath(componentName, getPaths());
  }

  if (!componentName) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(CONST.consoleMessages.server.missingComponentName);
    return;
  }

  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(CONST.browser.componentNotFound);
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
