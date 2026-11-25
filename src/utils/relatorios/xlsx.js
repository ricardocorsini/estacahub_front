import writeXlsxFile from "write-excel-file/universal";
import * as t from "./tabelas.js";

function aba(sheet, cabecalho, linhas) {
  if (linhas.length >= 1048576) throw new Error("A seleção excede o limite de linhas do Excel. Selecione menos estacas ou sondagens.");
  return {
    sheet, stickyRowsCount: 1,
    columns: cabecalho.map((nome) => ({ width: Math.max(18, nome.length + 4) })),
    data: [
      cabecalho.map((value) => ({ value, fontWeight: "bold", backgroundColor: "#483478", color: "#FFFFFF" })),
      ...linhas.map((linha) => linha.map((value) => value == null ? null : { value })),
    ],
  };
}

export function gerarXlsx(r) {
  const calculos = r.analises.filter((a) => a.estado === "calculado").map((a) => a.resultado);
  function porPar(linhas) {
    return calculos.flatMap((c) => linhas(c).map((l) => [c.nomeEstaca, c.nomeSondagem, ...l]));
  }
  const par = ["Estaca", "Sondagem"];
  const sheets = [
    aba("Identificação", ["Campo", "Valor"], t.identificacao(r)),
    aba("Estacas", t.colEstacas, r.estacas.map(t.linhaEstaca)),
    aba("Sondagens", t.colSondagens, r.sondagens.map(t.linhaSondagem)),
    aba("Leituras SPT", ["Sondagem", ...t.colLeituras], r.sondagens.flatMap((s) => s.leituras.map((l) => [s.nome, ...t.linhaLeitura(l)]))),
    aba("Resumo", t.colResumo, t.linhasResumo(r)),
    aba("Curvas", [...par, ...t.colCurvas], porPar(t.linhasCurva)),
    aba("Parâmetros", [...par, "Parâmetro", "Valor"], porPar(t.parametros)),
    aba("Ponta", [...par, "Cota memorial (m)", ...t.colPonta], porPar((c) =>
      c.memorial.leiturasPonta.map((l) => [c.memorial.cotaPontaM, ...t.linhaPonta(l)]))),
    aba("Fuste", [...par, "Cota memorial (m)", ...t.colFuste], porPar((c) =>
      c.memorial.camadasAtrito.map((l) => [c.memorial.cotaPontaM, ...t.linhaFuste(l)]))),
    aba("Trechos sem SPT", [...par, "Cota memorial (m)", "Topo (m)", "Base (m)"], porPar((c) =>
      c.memorial.trechosSemSpt.map((l) => [c.memorial.cotaPontaM, l.cotaTopoM, l.cotaBaseM]))),
  ];
  sheets[0].columns = [{ width: 36 }, { width: 78 }];
  return writeXlsxFile(sheets).toBlob();
}
