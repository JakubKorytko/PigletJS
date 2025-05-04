/** @import {SocketInterface, Member} from "@jsdocs/browser/classes/Socket.d" */
/** @import AppRoot from "@Piglet/browser/classes/AppRoot" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
import { getMountedComponentsByTag } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/** @implements {SocketInterface} */
class Socket {
  static instance = null;
  ws = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  reconnectInterval = 2000;

  constructor() {
    if (Socket.instance) {
      return Socket.instance;
    }

    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 2000;

    this.connect();
    Socket.instance = this;
  }

  /**
   * @type {Member["connect"]["Type"]}
   * @returns {Member["connect"]["ReturnType"]}
   */
  connect() {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
    }

    this.ws = new WebSocket("ws://" + location.host);

    this.ws.onopen = () => {
      window.Piglet.log(CONST.pigletLogs.socket.connected);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === CONST.socket.messageTypes.reload && message.data) {
        /** @type {ReactiveComponent[]} */
        const components = getMountedComponentsByTag(message.data);
        for (const component of components) {
          component.reloadComponent();
        }
      } else if (message.type === CONST.socket.messageTypes.reload) {
        /** @type {AppRoot} */
        const appRoot = document.querySelector(CONST.appRootTag);
        appRoot.changeRoute(appRoot._route);
      }

      if (message.type === CONST.socket.messageTypes.serverRestart) {
        window.Piglet.log(CONST.pigletLogs.socket.serverRestarted);
        this.tryReconnect();
      }

      if (message.type === CONST.socket.messageTypes.fullReload) {
        window.location.reload();
      }
    };

    this.ws.onclose = () => {
      window.Piglet.log(CONST.pigletLogs.socket.closed);
      this.tryReconnect();
    };

    this.ws.onerror = (error) => {
      window.Piglet.log(
        CONST.pigletLogs.socket.error,
        CONST.coreLogsLevels.error,
        error,
      );
      this.ws.close();
    };
  }

  /**
   * @type {Member["tryReconnect"]["Type"]}
   * @returns {Member["tryReconnect"]["ReturnType"]}
   */
  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      window.Piglet.log(
        CONST.pigletLogs.socket.maxReconnectAttempts,
        CONST.coreLogsLevels.warn,
      );
      return;
    }

    this.reconnectAttempts++;
    window.Piglet.log(
      CONST.pigletLogs.socket.reconnecting(
        this.reconnectInterval / 1000,
        this.reconnectAttempts,
      ),
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }
}

export default Socket;
