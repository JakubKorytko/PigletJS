import { resolvePath } from "@Piglet/utils/paths";
import path from "path";
import CONST from "@Piglet/misc/CONST";
import fs from "fs";
import { routeAliases } from "@Piglet/libs/routes";
import notFound from "@Piglet/libs/notfound";

export default (req, res) => {
  let pathWithoutPiglet = req.url.split("?")[0].replace("/Piglet/", "");

  if (req.url === "/Piglet" || req.url === "/Piglet/") {
    pathWithoutPiglet = "index";
  }

  const filePath = resolvePath(`@/browser/${pathWithoutPiglet}.mjs`);
  const ext = path.extname(filePath);
  const contentType = CONST.mimeTypes[ext] || "application/javascript";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // noinspection JSIgnoredPromiseFromCall
      notFound(res);
    } else {
      let code = data.toString();

      code = code.replace(/(['"])@Piglet\/browser\//g, "$1/Piglet/");

      const routesInjection = `const routes = ${JSON.stringify(routeAliases)};\n`;

      code = routesInjection + code;

      res.writeHead(200, { "Content-Type": contentType });
      res.end(code);
    }
  });
};
