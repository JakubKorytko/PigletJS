import { getMountedComponentsByTag } from "@Piglet/browser/helpers";
import CONST from "@Piglet/browser/CONST";

/**
 * Singleton class for managing WebSocket connections.
 * Automatically reconnects on server restarts or connection drops.
 */
class Socket {
  /** @type {Socket|null} */
  static instance = null;

  /**
   * Creates a new WebSocket connection or returns the existing singleton instance.
   */
  constructor() {
    if (Socket.instance) {
      return Socket.instance;
    }

    /**
     * The active WebSocket instance.
     * @type {WebSocket|null}
     */
    this.ws = null;

    /**
     * The number of attempted reconnections after disconnection.
     * @type {number}
     */
    this.reconnectAttempts = 0;

    /**
     * Maximum number of allowed reconnection attempts.
     * @type {number}
     */
    this.maxReconnectAttempts = 5;

    /**
     * Interval between reconnection attempts in milliseconds.
     * @type {number}
     */
    this.reconnectInterval = 2000;

    this.connect();

    Socket.instance = this;
  }

  /**
   * Establishes a new WebSocket connection and sets up event handlers.
   * If a connection already exists, it is properly closed first.
   *
   * @returns {void}
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
      Piglet.log(CONST.pigletLogs.socket.connected);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === CONST.socket.messageTypes.reload && message.data) {
        const components = getMountedComponentsByTag(message.data);
        for (const component of components) {
          component.reloadComponent();
        }
      } else if (message.type === CONST.socket.messageTypes.reload) {
        const appRoot = document.querySelector(CONST.appRootTag);
        // noinspection JSIgnoredPromiseFromCall
        appRoot.changeRoute(appRoot._route);
      }

      if (message.type === CONST.socket.messageTypes.serverRestart) {
        Piglet.log(CONST.pigletLogs.socket.serverRestarted);
        this.tryReconnect();
      }

      if (message.type === CONST.socket.messageTypes.fullReload) {
        window.location.reload();
      }
    };

    this.ws.onclose = () => {
      Piglet.log(CONST.pigletLogs.socket.closed);
      this.tryReconnect();
    };

    this.ws.onerror = (error) => {
      Piglet.log(
        CONST.pigletLogs.socket.error,
        CONST.coreLogsLevels.error,
        error,
      );
      this.ws.close();
    };
  }

  /**
   * Attempts to reconnect the WebSocket connection if the maximum number of attempts hasn't been reached.
   *
   * @returns {void}
   */
  tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Piglet.log(
        CONST.pigletLogs.socket.maxReconnectAttempts,
        CONST.coreLogsLevels.warn,
      );
      return;
    }

    this.reconnectAttempts++;
    Piglet.log(
      socketMessages.reconnecting(
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
