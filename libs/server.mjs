import http from "http";
import "@Piglet/utils/console.mjs";
import { proxyHandler, serverHandler } from "@Piglet/libs/helpers.mjs";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@Piglet/libs/socket.mjs";
import coreControllers from "@Piglet/controllers/index.mjs";

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
