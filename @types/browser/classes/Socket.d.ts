export interface SocketInterface {
  /** The active WebSocket instance */
  ws: WebSocket | null;

  /** The number of attempted reconnections after disconnection */
  reconnectAttempts: number;

  /** Maximum number of allowed reconnection attempts */
  maxReconnectAttempts: number;

  /** Interval between reconnection attempts in milliseconds */
  reconnectInterval: number;

  /** Establishes a new WebSocket connection and sets up event handlers */
  connect(): void;

  /** Attempts to reconnect the WebSocket connection */
  tryReconnect(): void;
}
