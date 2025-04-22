import http from "http";
import "@Piglet/utils/console.mjs";
import { proxyHandler, serverHandler } from "@Piglet/libs/helpers.mjs";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@Piglet/libs/socket.mjs";
import coreControllers from "@Piglet/controllers/index.mjs";

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
