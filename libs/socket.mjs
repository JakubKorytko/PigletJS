import crypto from "crypto";
import { clientsRef } from "@Piglet/libs/clientsRef";

/**
 * Creates a WebSocket message frame from a given payload.
 *
 * The payload is JSON-encoded and framed according to the WebSocket protocol
 * with a FIN bit set (0x81) and appropriate payload length handling.
 *
 * Supports payloads up to 65535 bytes.
 *
 * @param {Object} payload - The data to send over WebSocket, which will be JSON-stringified.
 * @returns {Buffer} A Buffer containing the properly framed WebSocket message.
 * @throws {Error} If the payload is too large (greater than 65535 bytes).
 */
function createWsMessage(payload) {
  const json = JSON.stringify(payload);
  const payloadBuf = Buffer.from(json);
  const length = payloadBuf.length;

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), payloadBuf]);
  } else if (length < 65536) {
    return Buffer.concat([
      Buffer.from([0x81, 126, length >> 8, length & 0xff]),
      payloadBuf,
    ]);
  } else {
    throw new Error("Payload too long");
  }
}

/**
 * Handles WebSocket handshake and manages socket connections.
 *
 * This function processes the WebSocket handshake, creates an accept key,
 * and establishes a WebSocket connection. It also adds the socket to the
 * `clientsRef.instance` array and removes it on connection close.
 *
 * @param {import("http").IncomingMessage} req - The HTTP request object from the WebSocket upgrade request.
 * @param {import("net").Socket} socket - The socket object representing the WebSocket connection.
 */
const socketHandler = (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  const acceptKey = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");

  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
  ];

  socket.write(headers.join("\r\n") + "\r\n\r\n");
  clientsRef.instance.push(socket);

  socket.on("close", () => {
    const i = clientsRef.instance.indexOf(socket);
    if (i !== -1) clientsRef.instance.splice(i, 1);
  });
};

/**
 * Sends a reload message to all connected WebSocket clients,
 * optionally targeting a specific component or resource.
 *
 * @param {string} [data] - Optional identifier for the resource or component to reload.
 * If omitted, clients will perform a full application reload.
 * @returns {void}
 */
const reloadClients = (data) =>
  sendMessageToSocketClients(createWsMessage({ type: "reload", data }));

/**
 * Notifies all connected WebSocket clients that the server is restarting.
 * Clients can use this information to attempt reconnection or show a message.
 *
 * @returns {void}
 */
const tellClientsAboutServerRestart = () => {
  sendMessageToSocketClients(createWsMessage({ type: "serverRestart" }));
};

/**
 * Forces all connected WebSocket clients to perform a full page reload.
 *
 * @returns {void}
 */
const fullReload = () => {
  sendMessageToSocketClients(createWsMessage({ type: "fullReload" }));
};

/**
 * Sends a raw WebSocket message to all currently connected clients.
 *
 * If a client connection fails during writing, the client socket will be destroyed.
 *
 * @param {string|Buffer} message - The message to send to each connected client.
 * @returns {void}
 */
const sendMessageToSocketClients = (message) => {
  clientsRef.instance.forEach((sock) => {
    sock.write(message, (err) => {
      if (err) {
        sock.destroy();
      }
    });
  });
};

/**
 * Listens for the "reload" message and triggers a reload for all connected clients.
 *
 * This function listens for messages from the process and, when it receives a
 * message of type "reload", calls the `reloadClients` function to send the
 * reload command to all clients.
 */
const runReloadClientOnWSMessageListener = () =>
  process.on("message", (msg) => {
    if (
      typeof msg === "object" &&
      msg !== null &&
      "type" in msg &&
      msg.type === "reload"
    ) {
      reloadClients();
    } else if (
      typeof msg === "object" &&
      msg !== null &&
      "type" in msg &&
      msg.type === "serverRestart"
    ) {
      tellClientsAboutServerRestart();
    }
  });

export {
  socketHandler,
  runReloadClientOnWSMessageListener,
  reloadClients,
  tellClientsAboutServerRestart,
  fullReload,
};
