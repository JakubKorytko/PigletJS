import http from "http";
import CONST from "@/core/CONST.mjs";
import "@/core/utils/console.mjs";
import { proxyHandler, serverHandler } from "@/core/libs/helpers.mjs";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@/core/libs/socket.mjs";
import coreControllers from "@/core/controllers/index.mjs";

runReloadClientOnWSMessageListener();

const server = new Proxy(http.createServer(serverHandler), proxyHandler);

server.on("upgrade", socketHandler);

server.customRoutes = {
  ...coreControllers,
};

server.listen(CONST.PORT, () => {});

export default server;
