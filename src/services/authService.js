import { apiRequest } from "./api";

export const authService = {
  cadastrar(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  entrar(payload) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  obterUsuarioAtual() {
    return apiRequest("/auth/me");
  },

  sair() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};
