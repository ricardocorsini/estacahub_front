import { apiRequest } from "./api";

export const obrasService = {
  listar() {
    return apiRequest("/obras");
  },

  obter(id) {
    return apiRequest(`/obras/${id}`);
  },

  criar(payload) {
    return apiRequest("/obras", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  atualizar(id, payload) {
    return apiRequest(`/obras/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  atualizarParcial(id, payload) {
    return apiRequest(`/obras/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remover(id) {
    return apiRequest(`/obras/${id}`, {
      method: "DELETE",
    });
  },
};