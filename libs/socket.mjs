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
 * @param {http.IncomingMessage} req - The HTTP request object from the WebSocket upgrade request.
 * @param {net.Socket} socket - The socket object representing the WebSocket connection.
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
 * Sends a reload message to all connected clients.
 *
 * This function creates a WebSocket message and sends it to all clients
 * in `clientsRef.instance`, requesting them to reload.
 */
const reloadClients = (data) => {
  const message = createWsMessage({ type: "reload", data });
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
    if (msg.type === "reload") {
      reloadClients();
    }
  });

export { socketHandler, runReloadClientOnWSMessageListener, reloadClients };
