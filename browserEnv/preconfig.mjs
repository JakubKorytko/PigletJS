import Piglet from "/Piglet/config";

const ws = new WebSocket("ws://" + location.host);

ws.onmessage = (event) => {
  if (event.data === "reload") {
    location.reload();
  }
};

window.Piglet = Piglet;
