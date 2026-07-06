import { Client } from "@stomp/stompjs";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws";

let client = null;
let connected = false;

/**
 * Connect to the WebSocket server using STOMP protocol.
 * @param {Object} options
 * @param {Function} [options.onConnect] - Called when connected
 * @param {Function} [options.onDisconnect] - Called when disconnected
 * @param {Function} [options.onError] - Called on STOMP error
 * @returns {Client} STOMP client instance
 */
export function connect({ onConnect, onDisconnect, onError } = {}) {
  if (client && connected) {
    onConnect?.();
    return client;
  }

  const token = localStorage.getItem("token");

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      connected = true;
      onConnect?.();
    },
    onDisconnect: () => {
      connected = false;
      onDisconnect?.();
    },
    onStompError: (frame) => {
      connected = false;
      onError?.(frame);
    },
    onWebSocketClose: () => {
      connected = false;
    },
  });

  client.activate();
  return client;
}

/**
 * Disconnect from the WebSocket server.
 */
export function disconnect() {
  if (client) {
    client.deactivate();
    client = null;
    connected = false;
  }
}

/**
 * Subscribe to a STOMP destination.
 * @param {string} destination - The topic/queue to subscribe to
 * @param {Function} callback - Called with the parsed message body
 * @returns {Object} Subscription object (call .unsubscribe() to stop)
 */
export function subscribe(destination, callback) {
  if (!client || !connected) {
    console.warn("[WS] Not connected. Cannot subscribe to", destination);
    return null;
  }

  return client.subscribe(destination, (message) => {
    try {
      const body = JSON.parse(message.body);
      callback(body);
    } catch {
      callback(message.body);
    }
  });
}

/**
 * Publish a message to a STOMP destination.
 * @param {string} destination - The app destination to send to
 * @param {Object|string} [body] - Message body (will be JSON.stringify'd if object)
 */
export function publish(destination, body = {}) {
  if (!client || !connected) {
    console.warn("[WS] Not connected. Cannot publish to", destination);
    return;
  }

  client.publish({
    destination,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/**
 * Check if WebSocket is currently connected.
 * @returns {boolean}
 */
export function isConnected() {
  return connected;
}

/**
 * Get the current client instance.
 * @returns {Client|null}
 */
export function getClient() {
  return client;
}

export const ws = {
  connect,
  disconnect,
  subscribe,
  publish,
  isConnected,
  getClient,
};
