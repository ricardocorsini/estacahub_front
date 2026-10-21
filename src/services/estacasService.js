import { apiRequest } from "./api";

function payloadEstaca(estaca) {
  return {
    nome: estaca.nome.trim(),
    coordX: estaca.coordX,
    coordY: estaca.coordY,
    tipo: estaca.tipo,
    diametroCm: estaca.diametroCm,
    capacidadeEstruturalTf: estaca.capacidadeEstruturalTf,
    cotaArrasamento: estaca.cotaArrasamento,
    cargaPrevistaTf: estaca.cargaPrevistaTf,
  };
}

export const estacasService = {
  listar(obraId) {
    return apiRequest(`/obras/${obraId}/estacas`);
  },
  criar(obraId, estaca) {
    return apiRequest(`/obras/${obraId}/estacas`, {
      method: "POST",
      body: JSON.stringify(payloadEstaca(estaca)),
    });
  },
  atualizar(obraId, estaca) {
    return apiRequest(`/obras/${obraId}/estacas/${estaca.id}`, {
      method: "PUT",
      body: JSON.stringify(payloadEstaca(estaca)),
    });
  },
  remover(obraId, id) {
    return apiRequest(`/obras/${obraId}/estacas/${id}`, { method: "DELETE" });
  },
};
