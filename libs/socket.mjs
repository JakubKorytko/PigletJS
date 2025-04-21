import crypto from "crypto";
import { clientsRef } from "@Piglet/libs/clientsRef.mjs";

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

const reloadClients = () => {
  const message = Buffer.from([0x81, 6, ...Buffer.from("reload")]);
  clientsRef.instance.forEach((sock) => {
    sock.write(message, (err) => {
      if (err) {
        sock.destroy();
      }
    });
  });
};

const runReloadClientOnWSMessageListener = () =>
  process.on("message", (msg) => {
    if (msg.type === "reload") {
      reloadClients();
    }
  });

export { socketHandler, runReloadClientOnWSMessageListener, reloadClients };
