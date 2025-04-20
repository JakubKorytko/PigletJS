import http from "http";
import "@/core/utils/console.mjs";
import { proxyHandler, serverHandler } from "@/core/libs/helpers.mjs";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@/core/libs/socket.mjs";
import coreControllers from "@/core/controllers/index.mjs";

const createServer = () => {
  runReloadClientOnWSMessageListener();

  const server = new Proxy(http.createServer(serverHandler), proxyHandler);

  server.on("upgrade", socketHandler);

  server.customRoutes = {
    ...coreControllers,
  };

  return server;
};

export default createServer();
