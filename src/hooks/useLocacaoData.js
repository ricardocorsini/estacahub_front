import { useEffect, useState } from "react";
import { obrasService } from "../services/obrasService";
import { estacasService } from "../services/estacasService";
import { sondagensService } from "../services/sondagensService";

// Publicada apenas após as três consultas terminarem. Nunca combina revisões distintas.
export async function carregarLocacao(
  obraId,
  servicos = { obrasService, estacasService, sondagensService },
) {
  const respostas = await Promise.allSettled([
    servicos.obrasService.obter(obraId),
    servicos.estacasService.listar(obraId),
    servicos.sondagensService.listar(obraId),
  ]);
  const nomes = ["obra", "estacas", "sondagens"];
  const erros = [];
  const valores = respostas.map((res, i) => {
    if (
      res.status === "fulfilled" &&
      (i === 0
        ? res.value && String(res.value.id) === String(obraId)
        : Array.isArray(res.value))
    )
      return res.value;
    erros.push(
      "Falha ao carregar " +
        nomes[i] +
        ": " +
        (res.reason?.message || "resposta inválida da API."),
    );
    return i === 0 ? null : [];
  });
  // O backend isola por obra/usuário; valide também os IDs quando expostos na resposta.
  if (
    valores[1].some(
      (e) => e.obraId != null && String(e.obraId) !== String(obraId),
    )
  ) {
    valores[1] = [];
    erros.push("A API retornou estacas de outra obra. Atualize os dados.");
  }
  return {
    obra: valores[0],
    estacas: valores[1],
    sondagens: valores[2],
    erros,
    completo: erros.length === 0,
    carregadoEm: new Date().toISOString(),
  };
}

export function useLocacaoData(obraId) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [revisao, setRevisao] = useState(0);
  useEffect(() => {
    let ativo = true;
    carregarLocacao(obraId).then((resposta) => {
      if (!ativo) return;
      setDados(resposta);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [obraId, revisao]);
  function atualizar() {
    setCarregando(true);
    setRevisao((r) => r + 1);
  }
  return { dados, carregando, atualizar };
}
