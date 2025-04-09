import http from "http";
import { processAllComponents } from "@/server/libs/componentBuilder.mjs";
import CONST from "@/src/CONST.mjs";
import { watchDirectory } from "@/watcher/methods.mjs";
import "@/utils/console.mjs";
import {
  proxyHandler,
  routeNames,
  serverHandler,
} from "@/server/libs/helpers.mjs";
import ComponentController from "@/server/controllers/component.controller.mjs";
import FileController from "@/server/controllers/file.controller.mjs";
import PageController from "@/server/controllers/page.controller.mjs";

const { component, page, file } = routeNames;

const server = new Proxy(http.createServer(serverHandler), proxyHandler);

server.customRoutes = {
  [component]: ComponentController,
  [file]: FileController,
  [page]: PageController,
};

server.listen(CONST.PORT, async () => {
  if ([...process.argv].includes("--restart")) {
    console.msg("server.restarted");
  } else {
    console.msg("server.running", CONST.PORT);
    console.msg("server.pressReload");
    console.msg("server.pressRestart");
  }

  try {
    await processAllComponents();
    watchDirectory();
  } catch (err) {
    console.msg("server.initError", err);
  }
});

export default server;
