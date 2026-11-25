import { cotaMaisAltaQueAtende } from "../cargaAdmissivel.js";

export const FORMATO = "estacahub-relatorio";
export const VERSAO = "1.0.0";

export function selecionarDados(dados, filtro) {
  if (!dados.completo) throw new Error(dados.erros.join(" "));
  function selecionar(lista, id) {
    if (!id) return lista;
    const item = lista.find((registro) => String(registro.id) === id);
    if (!item) throw new Error("O cadastro selecionado mudou. Atualize os dados da obra.");
    return [item];
  }
  // O formulário usa "" para campos sem valor. O contrato de intercâmbio usa null.
  const sondagens = selecionar(dados.sondagens, filtro.sondagem).map((s) => ({
    ...s, dadosCabecalho: normalizarCampos(s.dadosCabecalho), leituras: s.leituras.map(normalizarCampos),
  }));
  return { obra: dados.obra, estacas: selecionar(dados.estacas, filtro.estaca), sondagens };
}

function normalizarCampos(objeto) {
  return Object.fromEntries(Object.entries(objeto).map(([k, v]) => [k, v === "" ? null : v]));
}

async function calcularPar(obraId, estaca, sondagem, opcoes, calcular, signal) {
  const ids = { estacaId: estaca.id, sondagemId: sondagem.id };
  const pedido = { sondagemId: sondagem.id, opcoes };
  let curva;
  try {
    curva = await calcular(obraId, estaca.id, pedido, signal);
  } catch (erro) {
    if (erro.status !== 422 || !erro.codigo) throw erro;
    return { ...ids, estado: "indisponivel", codigo: erro.codigo, mensagem: erro.message };
  }
  const cotaAtendeM = cotaMaisAltaQueAtende(curva.curva, curva.cargaPrevistaTf);
  const cotaPontaM = cotaAtendeM ?? curva.curva.at(-1).cotaPontaM;
  const resultado = await calcular(obraId, estaca.id, { ...pedido, cotaPontaM }, signal);
  return { ...ids, estado: "calculado", cotaAtendeM, resultado };
}

export async function prepararRelatorio({ dados, opcoes, calcular, signal, progresso }) {
  const analises = [];
  const total = dados.estacas.length * dados.sondagens.length;
  for (const estaca of dados.estacas) {
    for (const sondagem of dados.sondagens) {
      signal.throwIfAborted();
      progresso(analises.length, total, estaca.nome, sondagem.nome);
      analises.push(await calcularPar(dados.obra.id, estaca, sondagem, opcoes, calcular, signal));
    }
  }
  signal.throwIfAborted();
  return {
    formato: FORMATO, versao: VERSAO, geradoEm: new Date().toISOString(),
    unidades: { coordenadas: "m", cotas: "m", profundidades: "m", diametros: "cm", cargas: ["tf", "kN"], tensoes: "kPa" },
    modo: "por_sondagem", opcoes, ...dados, analises,
  };
}

export function nomeArquivo(relatorio, formato) {
  const slug = relatorio.obra.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 55).replace(/^-|-$/g, "") || "obra";
  const ext = { compacto: "pdf", completo: "pdf", planilha: "xlsx", intercambio: "json" }[formato];
  return `estacahub-${slug}-${relatorio.obra.id}-${relatorio.geradoEm.slice(0, 10)}-${formato}.${ext}`;
}
