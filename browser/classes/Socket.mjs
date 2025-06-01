/** @import {SocketInterface, SocketInterfaceMembers} from "@jsdocs/browser/classes/Socket.d" */
/** @import AppRoot from "@Piglet/browser/classes/AppRoot" */
/** @import ReactiveComponent from "@Piglet/browser/classes/ReactiveComponent" */
import { getMountedComponentsByTag } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/** @implements {SocketInterface} */
class Socket {
  /**
   * Singleton instance of the SocketInterface
   * @type {SocketInterface|null}
   */
  static instance = null;

  /** @type {SocketInterfaceMembers["ws"]["Type"]} */
  ws = null;

  /** @type {SocketInterfaceMembers["reconnectAttempts"]["Type"]} */
  reconnectAttempts = 0;

  /** @type {SocketInterfaceMembers["maxReconnectAttempts"]["Type"]} */
  maxReconnectAttempts = 5;

  /** @type {SocketInterfaceMembers["reconnectInterval"]["Type"]} */
  reconnectInterval = 2000;

  constructor(root) {
    if (Socket.instance) {
      return Socket.instance;
    }

    this.root = root;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 2000;

    this.connect();
    Socket.instance = this;
  }

  /**
   * @type {SocketInterfaceMembers["connect"]["Type"]}
   * @returns {SocketInterfaceMembers["connect"]["ReturnType"]}
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
      console.pig(CONST.pigletLogs.socket.connected);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === CONST.socket.messageTypes.reload && message.data) {
        if (message.data === "layout") {
          this.root.changeRoute(this.root._route);
          return;
        }
        /** @type {ReactiveComponent[]} */
        const components = getMountedComponentsByTag(
          message.data,
          this.root,
        ).filter((component) => component.internal.HMR);
        for (const component of components) {
          component._mount(CONST.reason.WSReload);
        }
      } else if (message.type === CONST.socket.messageTypes.reload) {
        /** @type {AppRoot} */
        const appRoot = document.querySelector(CONST.appRootTag);
        // noinspection JSIgnoredPromiseFromCall
        appRoot.changeRoute(appRoot._route);
      }

      if (message.type === CONST.socket.messageTypes.serverRestart) {
        console.pig(CONST.pigletLogs.socket.serverRestarted);
        this.tryReconnect();
      }

      if (message.type === CONST.socket.messageTypes.fullReload) {
        window.location.reload();
      }
    };

    this.ws.onclose = () => {
      console.pig(CONST.pigletLogs.socket.closed);
      this.tryReconnect();
    };

    this.ws.onerror = (error) => {
      console.pig(
        CONST.pigletLogs.socket.error,
        CONST.coreLogsLevels.error,
        error,
      );
      this.ws.close();
    };
  }

  /**
   * @type {SocketInterfaceMembers["tryReconnect"]["Type"]}
   * @returns {SocketInterfaceMembers["tryReconnect"]["ReturnType"]}
   */
  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.pig(
        CONST.pigletLogs.socket.maxReconnectAttempts,
        CONST.coreLogsLevels.warn,
      );
      return;
    }

    this.reconnectAttempts++;
    console.pig(
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
