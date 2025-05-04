import http from "http";
import console from "@Piglet/utils/console";
import { proxyHandler, serverHandler } from "@Piglet/libs/helpers";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@Piglet/libs/socket";
import coreControllers from "@Piglet/controllers/index";

/**
 * @typedef {http.Server & { customRoutes: Record<string, Function> }} CustomServer
 */

/**
 * Creates and configures the HTTP server.
 *
 * The server is set up with custom routes and handlers, including a WebSocket upgrade listener.
 * It also runs the `runReloadClientOnWSMessageListener` for WebSocket communication.
 *
 * @returns CustomServer - The configured HTTP server instance.
 */
const createServer = () => {
  runReloadClientOnWSMessageListener();

  const server = new Proxy(http.createServer(serverHandler), proxyHandler);

  server.on("upgrade", socketHandler);

  server.customRoutes = {
    ...coreControllers,
  };

  // noinspection JSValidateTypes
  return server;
};

export default createServer();
