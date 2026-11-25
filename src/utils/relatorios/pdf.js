import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { CRITERIOS_GOVERNANTES, METODOS_CARGA } from "../cargaAdmissivel.js";
import * as t from "./tabelas.js";

const formato = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 6 });
const texto = (v) => typeof v === "number" ? formato.format(v) : String(v ?? "—");
const cores = { decourtQuaresma: "#583793", aokiVelloso: "#007D71" };

function grafico(doc, r, y) {
  const left = 37, right = 186, top = y + 8, bottom = y + 48;
  const teto = Math.max(1, r.cargaPrevistaTf, ...r.curva.flatMap((p) =>
    METODOS_CARGA.map(({ chave }) => p[chave].cargaAdmissivelFinalTf)));
  const alta = r.curva[0].cotaPontaM, baixa = r.curva.at(-1).cotaPontaM;
  const x = (tf) => left + tf / teto * (right - left);
  const altura = (cota) => alta === baixa ? (top + bottom) / 2 : top + (alta - cota) / (alta - baixa) * (bottom - top);
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor("#374151");
  doc.text("Cota (m)", left - 16, top - 3);
  doc.setDrawColor("#BBB7C5").setLineWidth(0.2);
  doc.line(left, top, left, bottom);
  doc.line(left, bottom, right, bottom);
  for (const cota of new Set([alta, baixa])) doc.text(texto(cota), left - 2, altura(cota) + 1, { align: "right" });
  doc.text("0", left, bottom + 4);
  doc.text(texto(teto) + " tf", right, bottom + 4, { align: "right" });
  if (r.cargaPrevistaTf > 0) {
    doc.setDrawColor("#64616C").setLineDashPattern([1, 1], 0);
    doc.line(x(r.cargaPrevistaTf), top, x(r.cargaPrevistaTf), bottom);
    doc.setLineDashPattern([], 0);
  }
  for (const [i, { chave, nome }] of METODOS_CARGA.entries()) {
    doc.setDrawColor(cores[chave]).setFillColor(cores[chave]).setLineWidth(0.55);
    let anterior;
    for (const p of r.curva) {
      const ponto = [x(p[chave].cargaAdmissivelFinalTf), altura(p.cotaPontaM)];
      if (anterior) doc.line(...anterior, ...ponto);
      doc.circle(...ponto, 0.55, "F");
      anterior = ponto;
    }
    doc.setTextColor(cores[chave]).text(nome, left + i * 38, bottom + 10);
  }
  if (r.cargaPrevistaTf > 0) doc.setTextColor("#45424A").text("Tracejado: carga prevista", left + 76, bottom + 10);
}

export function gerarPdf(r, completo) {
  const doc = new jsPDF({ format: "a4", compress: true, putOnlyUsedFonts: true });
  const titulo = completo ? "Memorial completo" : "Relatório compacto";
  doc.setProperties({ title: titulo + " · " + r.obra.nome, author: "EstacaHub" });
  let y = 26;
  function novaPagina() { doc.addPage(); y = 26; }
  function reservar(h) { if (y + h > 279) novaPagina(); }
  function textoBloco(conteudo, tamanho = 10, forte = false) {
    doc.setFont("helvetica", forte ? "bold" : "normal").setFontSize(tamanho).setTextColor("#262133");
    const altura = tamanho * 0.47;
    for (const linha of doc.splitTextToSize(String(conteudo), 181)) {
      reservar(altura); doc.text(linha, 14, y); y += altura;
    }
    y += 2;
  }
  function tabela(tituloSecao, colunas, linhas) {
    reservar(28);
    textoBloco(tituloSecao, 12, true);
    if (!linhas.length) { textoBloco("Sem registros."); return; }
    autoTable(doc, {
      startY: y, margin: { top: 22, bottom: 17, left: 14, right: 14 },
      head: [colunas], body: linhas.map((l) => l.map(texto)),
      styles: { fontSize: 8, cellPadding: 1.7, overflow: "linebreak" },
      headStyles: { fillColor: "#493578" }, alternateRowStyles: { fillColor: "#F5F3F8" },
    });
    y = doc.lastAutoTable.finalY + 9;
  }

  textoBloco(titulo, 21, true);
  textoBloco(r.obra.nome, 15);
  const identificacao = t.identificacao(r);
  tabela("Identificação e critérios", ["Campo", "Valor"], completo ? identificacao : identificacao.filter(([k]) => k !== "Observações"));
  tabela("Atendimento da carga prevista", t.colResumo, t.linhasResumo(r));

  if (completo) {
    novaPagina();
    tabela("Cadastro das estacas", t.colEstacas, r.estacas.map(t.linhaEstaca));
    tabela("Cadastro das sondagens", t.colSondagens, r.sondagens.map(t.linhaSondagem));
    for (const s of r.sondagens) tabela("Leituras SPT · " + s.nome, t.colLeituras, s.leituras.map(t.linhaLeitura));
    for (const a of r.analises) {
      if (a.estado !== "calculado") continue;
      novaPagina();
      const c = a.resultado, m = c.memorial;
      textoBloco(c.nomeEstaca + " · " + c.nomeSondagem, 16, true);
      textoBloco("Carga admissível por cota de ponta", 12, true);
      grafico(doc, c, y);
      y += 67;
      for (const { chave, nome } of METODOS_CARGA) {
        tabela(nome, ["Cota (m)", "L (m)", "NSPT ponta", "Fuste (kN)", "Ponta (kN)", "Ruptura (kN)", "Final (tf)", "Critério"],
          c.curva.map((p) => {
            const v = p[chave];
            return [p.cotaPontaM, p.comprimentoNaGradeM, p.nsptPonta, v.resistenciaLateralKn, v.resistenciaPontaKn,
              v.resistenciaRupturaKn, v.cargaAdmissivelFinalTf, CRITERIOS_GOVERNANTES[v.criterioGovernante]];
          }));
      }
      reservar(35);
      textoBloco("Memorial da cota " + texto(m.cotaPontaM) + " m", 15, true);
      textoBloco(a.cotaAtendeM == null ? "Detalhe da cota mais profunda calculada. Nenhuma cota de atendimento foi identificada."
        : t.criterioCota);
      const ponto = c.curva.find((p) => p.cotaPontaM === m.cotaPontaM);
      tabela("Composição da carga admissível", ["Método", "Global (kN)", "Parcial (kN)", "Geotécnica (kN)", "Estrutural (kN)", "Final (kN)"],
        METODOS_CARGA.map(({ chave, nome }) => {
          const v = ponto[chave];
          return [nome, v.cargaAdmissivelGlobalKn, v.cargaAdmissivelParcialKn, v.cargaAdmissivelGeotecnicaKn,
            c.capacidadeEstruturalKn, v.cargaAdmissivelFinalKn];
        }));
      tabela("Parâmetros e coeficientes", ["Parâmetro", "Valor"], t.parametros(c));
      tabela("Amostras usadas na ponta", t.colPonta, m.leiturasPonta.map(t.linhaPonta));
      tabela("Atrito por camada", t.colFuste, m.camadasAtrito.map(t.linhaFuste));
      tabela("Trechos sem contribuição de SPT", ["Topo (m)", "Base (m)"], m.trechosSemSpt.map((l) => [l.cotaTopoM, l.cotaBaseM]));
    }
  }
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setTextColor("#493578").setFont("helvetica", "bold").setFontSize(10).text("EstacaHub", 14, 12);
    doc.setDrawColor("#D9D5E2").setLineWidth(0.25).line(14, 15, 196, 15);
    doc.setTextColor("#514C59").setFont("helvetica", "normal").setFontSize(8)
      .text("Capacidade de carga em estacas", 14, 288).text(i + " / " + paginas, 196, 288, { align: "right" });
  }
  return doc.output("blob");
}
