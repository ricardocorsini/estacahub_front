import { CRITERIOS_GOVERNANTES, METODOS_CARGA, TRATAMENTOS_PONTA } from "../cargaAdmissivel.js";
import { nomeTipoEstaca } from "../estacas.js";

const simNao = (v) => v ? "Sim" : "Não";
export const criterioCota = "Cota mais alta da grade em que os dois métodos atingem a carga prevista.";
export const avisoCalculo = (codigo) => codigo === "verificar_contato_ponta" ? "Verificar o contato da ponta." : codigo;

export function identificacao({ obra, geradoEm, estacas, sondagens, opcoes }) {
  return [
    ["Obra", obra.nome], ["Número da obra", obra.numero], ["Localização", obra.localizacao],
    ["Responsável técnico", obra.responsavelTecnico], ["Sistema de coordenadas", obra.sistemaCoordenadas],
    ["Emissão (UTC)", geradoEm], ["Estacas incluídas", estacas.length], ["Sondagens incluídas", sondagens.length],
    ["Modo de cálculo", "Perfil individual de cada sondagem"], ["Critério de atendimento", criterioCota],
    ["Tratamento da ponta", TRATAMENTOS_PONTA[opcoes.tratamentoPonta]],
    ["Desprezar último metro de atrito", simNao(opcoes.desprezaUltimoMetroAtrito)],
    ["Aplicar redutor de ponta por tipo", simNao(opcoes.aplicaRedutorPonta)],
    ["Limitar ponta pelo fuste", simNao(opcoes.limitaPontaPorAtrito)], ["Observações", obra.observacoes],
  ];
}

export const colEstacas = ["Estaca", "Tipo", "X (m)", "Y (m)", "Diâmetro (cm)", "Arrasamento (m)", "Cap. estrutural (tf)", "Prevista (tf)"];
export function linhaEstaca(e) {
  return [e.nome, nomeTipoEstaca(e.tipo), e.coordX, e.coordY, e.diametroCm, e.cotaArrasamento, e.capacidadeEstruturalTf, e.cargaPrevistaTf];
}

export const colSondagens = ["Sondagem", "X (m)", "Y (m)", "Boca (m)", "Prof. final (m)", "Nível d'água (m)", "Paralisação"];
export function linhaSondagem({ nome, dadosCabecalho: s }) {
  return [nome, s.coordX, s.coordY, s.cotaBoca, s.profundidadeFinal, s.nivelAgua, s.criterio];
}
export const colLeituras = ["Prof. (m)", "Cota cadastrada (m)", "NSPT", "Solo", "Família"];
export function linhaLeitura(l) { return [l.profundidade, l.cota, l.nspt, l.solo, l.familia]; }

export const colResumo = ["Estaca", "Sondagem", "Prevista (tf)", "Cota atendida (m)", "DQ (tf) na cota", "AV (tf) na cota", "Situação / avisos"];
export function linhasResumo(r) {
  const estacas = new Map(r.estacas.map((e) => [e.id, e]));
  const sondagens = new Map(r.sondagens.map((s) => [s.id, s.nome]));
  return r.analises.map((a) => {
    const e = estacas.get(a.estacaId);
    const prefixo = [e.nome, sondagens.get(a.sondagemId), e.cargaPrevistaTf];
    if (a.estado === "indisponivel") return [...prefixo, null, null, null, "Indisponível: " + a.mensagem];
    const res = a.resultado;
    const p = res.curva.find((ponto) => ponto.cotaPontaM === a.cotaAtendeM);
    const situacao = p ? "Atende" : res.cargaPrevistaTf > 0 ? "Nenhuma cota atende" : "Sem carga prevista positiva";
    return [...prefixo, a.cotaAtendeM, p?.decourtQuaresma.cargaAdmissivelFinalTf ?? null,
      p?.aokiVelloso.cargaAdmissivelFinalTf ?? null, [situacao, ...res.avisos.map(avisoCalculo)].join(". ")];
  });
}

export const colCurvas = ["Cota (m)", "L na grade (m)", "NSPT ponta", "Fuste sem SPT (m)", "Método", "Lateral (kN)", "Ponta bruta (kN)", "Ponta (kN)", "Ruptura (kN)", "Adm. global (kN)", "Adm. parcial (kN)", "Geotécnica (kN)", "Final (kN)", "Final (tf)", "Critério"];
export function linhasCurva(r) {
  return r.curva.flatMap((p) => METODOS_CARGA.map(({ chave, nome }) => {
    const m = p[chave];
    return [p.cotaPontaM, p.comprimentoNaGradeM, p.nsptPonta, p.comprimentoFusteSemSptM,
      nome, m.resistenciaLateralKn, m.resistenciaPontaBrutaKn, m.resistenciaPontaKn, m.resistenciaRupturaKn,
      m.cargaAdmissivelGlobalKn, m.cargaAdmissivelParcialKn, m.cargaAdmissivelGeotecnicaKn,
      m.cargaAdmissivelFinalKn, m.cargaAdmissivelFinalTf, CRITERIOS_GOVERNANTES[m.criterioGovernante]];
  }));
}

export const colPonta = ["Cota grade (m)", "Cota leitura (m)", "Solo", "NSPT medido", "NSPT adotado"];
export const linhaPonta = (l) => [l.cotaGradeM, l.cotaLeituraM, l.solo, l.nsptMedido, l.nsptUsado];
export const colFuste = ["Topo (m)", "Base (m)", "Solo", "NSPT medido", "Desprezada", "DQ (kN)", "AV (kN)"];
export function linhaFuste(l) {
  return [l.amostra.cotaGradeM, l.cotaBaseM, l.amostra.solo, l.amostra.nsptMedido, simNao(l.desprezada),
    l.decourtQuaresma.resistenciaKn, l.aokiVelloso.resistenciaKn];
}
export function parametros(r) {
  const m = r.memorial;
  return [
    ["Cota do memorial (m)", m.cotaPontaM], ["Área de ponta (m²)", r.areaPontaM2], ["Perímetro (m)", r.perimetroM],
    ["FS global", r.fsGlobal], ["FS lateral DQ", r.fsLateralDecourtQuaresma], ["FS de ponta DQ", r.fsPontaDecourtQuaresma],
    ["Fator aplicado à ponta", r.fatorRedutorPonta], ["kN por tf", r.knPorTf],
    ["DQ · C (kPa)", m.pontaDecourtQuaresma.cKpa], ["DQ · alfa", m.pontaDecourtQuaresma.alfa],
    ["DQ · tensão de ponta (kPa)", m.pontaDecourtQuaresma.tensaoKpa],
    ["AV · K (kPa)", m.pontaAokiVelloso.kKpa], ["AV · F1", m.pontaAokiVelloso.f1],
    ["AV · tensão de ponta (kPa)", m.pontaAokiVelloso.tensaoKpa],
  ];
}
