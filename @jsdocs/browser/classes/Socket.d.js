/** @import {InterfaceMethodTypes} from "@jsdocs/_utils" */

/**
 * @interface SocketInterface
 */
class SocketInterface {
  /**
   * The active WebSocket instance
   * @type {WebSocket|null}
   */
  ws;

  /**
   * The number of attempted reconnections after disconnection
   * @type {number}
   */
  reconnectAttempts;

  /**
   * Maximum number of allowed reconnection attempts
   * @type {number}
   */
  maxReconnectAttempts;

  /**
   * Interval between reconnection attempts in milliseconds
   * @type {number}
   */
  reconnectInterval;

  /**
   * Establishes a new WebSocket connection and sets up event handlers
   * @returns {void}
   */
  connect() {}

  /**
   * Attempts to reconnect the WebSocket connection
   * @returns {void}
   */
  tryReconnect() {}
}

/** @typedef {InterfaceMethodTypes<SocketInterface>} SocketInterfaceMembers */

export {
  /** @exports SocketInterfaceMembers */
  SocketInterface,
};
