import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/auth";
import { ws } from "../services/websocket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getUser());
  const [loading, setLoading] = useState(false);

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
