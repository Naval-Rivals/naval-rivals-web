const API_BASE = import.meta.env.VITE_API_BASE;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Listener global para interceptar respostas 401 (token expirado/inválido)
let onUnauthorized = null;

/**
 * Registra um callback que será chamado quando qualquer requisição retornar 401.
 * Usado pelo AuthContext para limpar sessão e redirecionar ao login.
 * @param {Function} callback
 */
export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);

    // Se 401 em endpoint autenticado, notificar o handler global (sessão expirada/inválida).
    // Ignora endpoints de auth (login/register) onde 401 significa credenciais inválidas.
    // Ignora 401 em /users/me/password onde 401 significa senha atual incorreta.
    const isAuthEndpoint = endpoint.startsWith("/auth/");
    const isPasswordChange = endpoint === "/users/me/password";
    if (res.status === 401 && onUnauthorized && !isAuthEndpoint && !isPasswordChange) {
      onUnauthorized();
    }

    throw new ApiError(
      errorData?.message || `Erro HTTP ${res.status}`,
      res.status,
      errorData,
    );
  }

  return res.status === 204 ? null : res.text().then((text) => text ? JSON.parse(text) : null);
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint, data) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (endpoint, data) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
