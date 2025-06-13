import http from "http";
import console from "@Piglet/utils/console";
import { proxyHandler, serverHandler } from "@Piglet/libs/helpers";
import {
  runReloadClientOnWSMessageListener,
  socketHandler,
} from "@Piglet/libs/socket";
import coreControllers from "@Piglet/controllers/index";

/** @typedef {import("http").Server} Server */
/** @typedef {import("http").ServerResponse} ServerResponse */
/** @typedef {import("http").IncomingMessage} IncomingMessage */

/**
 * @typedef {
 * http.Server & {
 *    customRoutes: Record<string, Function>,
 *    middleware: (callbackFn: (req: PigletRequest, res: ServerResponse) => boolean) => void}
 * } CustomServer
 */

/**
 * @typedef {IncomingMessage & {
 *  pigDescription: {
 *     type: string,
 *     value: string,
 *     params: Record<string, string>
 *   },
 *   socket: IncomingMessage["Socket"] & {server: CustomServer}
 * }} PigletRequest
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
  server.middleware = (callback) => {
    server.customRoutes.middleware = callback;
  };

  server.on("upgrade", socketHandler);

  server.customRoutes = {
    ...coreControllers,
  };

  // noinspection JSValidateTypes
  return server;
};

export default createServer();
/** @exports PigletRequest */
/** @exports CustomServer */
/** @exports ServerResponse */
