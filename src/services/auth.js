import { api } from "./api";

const TOKEN_KEY = "token";

export const auth = {
  async login({ login, password }) {
    const data = await api.post("/auth/login", { login, password });
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
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  async getUser() {
    const data = await api.get("/users/me");
    return data;
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  // localStorage.setItem(
  //   USER_KEY,
  //   JSON.stringify({ id: data.id, nickname: data.nickname, email: data.email }),
  // );
}
