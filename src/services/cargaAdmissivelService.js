import { apiRequest } from "./api";

export const cargaAdmissivelService = {
  async calcular(obraId, estacaId, { sondagemId, opcoes, cotaPontaM }, signal) {
    const payload = { sondagemId, opcoes };
    if (cotaPontaM != null) payload.cotaPontaM = cotaPontaM;

    let dados;
    try {
      dados = await apiRequest(
        `/obras/${obraId}/estacas/${estacaId}/carga-admissivel`,
        { method: "POST", body: JSON.stringify(payload), signal },
      );
    } catch (error) {
      if (error.status === 404 && error.message === "Not Found") {
        throw new Error(
          "A rota de carga admissível ainda não está disponível no servidor.",
          { cause: error },
        );
      }
      throw error;
    }

    if (
      String(dados?.obraId) !== String(obraId) ||
      dados?.estacaId !== estacaId ||
      dados?.sondagemId !== sondagemId ||
      !Array.isArray(dados?.curva) ||
      dados.curva.length === 0 ||
      (cotaPontaM != null &&
        (dados.memorial?.cotaPontaM !== cotaPontaM ||
          !dados.curva.some((ponto) => ponto.cotaPontaM === cotaPontaM)))
    ) {
      throw new Error("A API retornou um resultado incompleto ou diferente da seleção.");
    }
    return dados;
  },
};
