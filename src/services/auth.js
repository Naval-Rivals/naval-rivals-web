import { api } from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const auth = {
  async login({ email, password }) {
    const data = await api.post("/auth/login", { email, password });
    saveSession(data);
    return data;
  },

  async register({ nickname, email, password, passwordConfirmation }) {
    const data = await api.post("/auth/register", {
      nickname,
      email,
      password,
      passwordConfirmation,
    });
    saveSession(data);
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ id: data.id, nickname: data.nickname, email: data.email }),
  );
}
