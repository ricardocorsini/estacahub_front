import { apiRequest } from "./api";

function valorOuVazio(valor) {
  return valor ?? "";
}

function normalizarSondagem(sondagem) {
  const cabecalho = sondagem.dadosCabecalho || {};

  return {
    ...sondagem,
    dadosCabecalho: {
      cotaBoca: valorOuVazio(cabecalho.cotaBoca),
      profundidadeFinal: valorOuVazio(cabecalho.profundidadeFinal),
      criterio: valorOuVazio(cabecalho.criterio),
      nivelAgua: valorOuVazio(cabecalho.nivelAgua),
      coordX: valorOuVazio(cabecalho.coordX),
      coordY: valorOuVazio(cabecalho.coordY),
    },
    leituras: (sondagem.leituras || []).map((leitura) => ({
      ...leitura,
      profundidade: valorOuVazio(leitura.profundidade),
      cota: valorOuVazio(leitura.cota),
      nspt: valorOuVazio(leitura.nspt),
      solo: valorOuVazio(leitura.solo),
      familia: valorOuVazio(leitura.familia),
    })),
  };
}

function criarPayload(sondagem) {
  return {
    nome: sondagem.nome,
    dadosCabecalho: sondagem.dadosCabecalho,
    leituras: sondagem.leituras.map((leitura) => ({
      profundidade: leitura.profundidade,
      cota: leitura.cota,
      nspt: leitura.nspt,
      solo: leitura.solo,
      familia: leitura.familia,
    })),
  };
}

export const sondagensService = {
  async listar(obraId) {
    const sondagens = await apiRequest(`/obras/${obraId}/sondagens`);
    return sondagens.map(normalizarSondagem);
  },

  async criar(obraId, sondagem) {
    const resposta = await apiRequest(`/obras/${obraId}/sondagens`, {
      method: "POST",
      body: JSON.stringify(criarPayload(sondagem)),
    });
    return normalizarSondagem(resposta);
  },

  async atualizar(obraId, sondagem) {
    const resposta = await apiRequest(
      `/obras/${obraId}/sondagens/${sondagem.id}`,
      {
        method: "PUT",
        body: JSON.stringify(criarPayload(sondagem)),
      },
    );
    return normalizarSondagem(resposta);
  },

  remover(obraId, sondagemId) {
    return apiRequest(`/obras/${obraId}/sondagens/${sondagemId}`, {
      method: "DELETE",
    });
  },
};
