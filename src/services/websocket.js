import { Client } from "@stomp/stompjs";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws";

let client = null;
let connected = false;

let currentOnConnect = null;
let currentOnDisconnect = null;
let currentOnError = null;

// Listener global para interceptar erros de autenticação no WebSocket
let onWsUnauthorized = null;

/**
 * Registra um callback que será chamado quando o WebSocket receber erro de autenticação.
 * Usado pelo AuthContext para limpar sessão e redirecionar ao login.
 * @param {Function} callback
 */
export function setOnWsUnauthorized(callback) {
  onWsUnauthorized = callback;
}

/**
 * Connect to the WebSocket server using STOMP protocol.
 * @param {Object} options
 * @param {Function} [options.onConnect] - Called when connected
 * @param {Function} [options.onDisconnect] - Called when disconnected
 * @param {Function} [options.onError] - Called on STOMP error
 * @returns {Client} STOMP client instance
 */
export function connect({ onConnect, onDisconnect, onError } = {}) {
  // Update the active callbacks
  if (onConnect) currentOnConnect = onConnect;
  if (onDisconnect) currentOnDisconnect = onDisconnect;
  if (onError) currentOnError = onError;

  // Already connected — call onConnect immediately
  if (client && connected) {
    onConnect?.();
    return client;
  }

  // Connection in progress — wait for it to complete
  if (client && !connected) {
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
      currentOnConnect?.();
    },
    onDisconnect: () => {
      connected = false;
      currentOnDisconnect?.();
    },
    onStompError: (frame) => {
      // O servidor envia STOMP ERROR quando o token é inválido/expirado
      const message = frame.headers?.["message"] || "";
      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("401") ||
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("jwt") ||
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("invalid")
      ) {
        // Desativar reconnect para não ficar em loop
        if (client) {
          client.reconnectDelay = 0;
          client.deactivate();
        }
        connected = false;
        onWsUnauthorized?.();
      }
      currentOnError?.(frame);
    },
    onWebSocketError: (event) => {
      console.error("[WS ERROR]", event);
      currentOnError?.(event);
    },
    onWebSocketClose: (event) => {
      connected = false;
      currentOnDisconnect?.();
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
    currentOnConnect = null;
    currentOnDisconnect = null;
    currentOnError = null;
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
