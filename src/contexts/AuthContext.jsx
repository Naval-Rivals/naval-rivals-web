import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { auth } from "../services/auth";
import { ws } from "../services/websocket";
import { setOnUnauthorized } from "../services/api";
import { setOnWsUnauthorized } from "../services/websocket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Flag para evitar múltiplas chamadas simultâneas de sessionExpired
  const isLoggingOut = useRef(false);

  /**
   * Chamado quando qualquer requisição HTTP ou WebSocket detecta token inválido/expirado.
   * Limpa a sessão e redireciona para o login.
   */
  const handleSessionExpired = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    auth.logout();
    ws.disconnect();
    setUser(null);
    navigate("/login", { replace: true });

    // Reset flag após breve delay para permitir novas detecções no futuro
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 1000);
  }, [navigate]);

  // Registrar os interceptors globais para 401
  useEffect(() => {
    setOnUnauthorized(handleSessionExpired);
    setOnWsUnauthorized(handleSessionExpired);

    return () => {
      setOnUnauthorized(null);
      setOnWsUnauthorized(null);
    };
  }, [handleSessionExpired]);

  useEffect(() => {
    const storedUser = auth.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  async function login({ login: loginValue, password }) {
    setLoading(true);
    try {
      const data = await auth.login({ login: loginValue, password });
      setUser({ id: data.id, nickname: data.nickname, email: data.email });
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function register({ nickname, email, password, passwordConfirmation }) {
    setLoading(true);
    try {
      const data = await auth.register({
        nickname,
        email,
        password,
        passwordConfirmation,
      });
      setUser({ id: data.id, nickname: data.nickname, email: data.email });
      return data;
    } finally {
      setLoading(false);
    }
  }

  function updateUser(data) {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    auth.logout();
    ws.disconnect();
    setUser(null);
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
