import test from "node:test";
import assert from "node:assert/strict";
import DxfParser from "dxf-parser";
import { gerarDxfCompleto } from "../src/utils/dxf/exportarLocacao.js";
import {
  calcularLayoutLocacao,
  LAYERS,
} from "../src/utils/dxf/layoutLocacao.js";
import { normalizarLocacao } from "../src/utils/locacao.js";
import {
  escaparMText,
  nomeArquivoObra,
  quebrarTextoLargura,
  larguraTexto,
} from "../src/utils/dxf/texto.js";
import { obra, estacas, sondagens } from "./fixture.js";
const datas = {
  geradoEm: "2026-10-28T18:00:00Z",
  carregadoEm: "2026-10-28T17:55:00Z",
};
const gerar = (es = estacas, ss = sondagens, o = obra) =>
  gerarDxfCompleto(normalizarLocacao(o, es, ss), datas);

test("DXF reabre com parser independente: unidade, layers, centros e diâmetro", () => {
  const { conteudo, resumo } = gerar(),
    dxf = new DxfParser().parseSync(conteudo);
  assert.equal(dxf.header.$INSUNITS, 6);
  assert.equal(dxf.header.$ACADVER, "AC1021");
  for (const layer of Object.values(LAYERS))
    assert.ok(dxf.tables.layer.layers[layer.nome]);
  assert.ok(dxf.entities.every((e) => e.layer !== "0"));
  const circulos = dxf.entities.filter(
    (e) => e.type === "CIRCLE" && e.layer === LAYERS.estacas.nome,
  );
  assert.equal(circulos.length, 2);
  assert.equal(circulos[0].center.x, 0);
  assert.equal(circulos[0].center.y, 0);
  assert.equal(circulos[0].radius * 2, 0.4);
  assert.equal(Math.hypot(circulos[1].center.x, circulos[1].center.y), 5);
  const furos = dxf.entities.filter(
    (e) => e.type === "INSERT" && e.layer === LAYERS.sondagens.nome,
  );
  assert.equal(furos.length, 1);
  assert.equal(furos[0].position.x, 0);
  assert.equal(furos[0].position.y, 0);
  const dims = dxf.entities.filter((e) => e.type === "DIMENSION");
  assert.equal(dims.length, 3);
  assert.ok(dims.some((e) => e.actualMeasurement === 5));
  for (const e of dims) assert.ok(dxf.blocks[e.block].entities.length > 0);
  assert.equal(resumo.registros, 4);
  assert.equal(resumo.semLocacao, 1);
});
test("todos os cadastros, leituras, nomes longos, zeros e acentos presentes, sem mutações ou duplicação", () => {
  const antes = JSON.stringify({ obra, estacas, sondagens });
  const a = gerar(),
    b = gerar();
  assert.equal(a.conteudo, b.conteudo);
  assert.equal(antes, JSON.stringify({ obra, estacas, sondagens }));
  const layout = calcularLayoutLocacao(
    normalizarLocacao(obra, estacas, sondagens),
    datas,
  );
  const textos = layout.entidades
    .filter((e) => e.tipo === "texto")
    .map((e) => e.valor)
    .join(" ");
  for (const t of [
    "Não informado",
    "-2.123456",
    "-5.123456",
    "Areia fina",
    "Argila siltosa",
    "Capacidade estrutural",
    "SP-02",
    "Leituras SPT",
    "Folha",
    "Quadro cadastral de estacas",
  ])
    assert.ok(textos.includes(t), t);
  const normal = (s) => s.replace(/\s/g, "");
  assert.ok(normal(textos).includes(normal(estacas[1].nome)));
  assert.ok(a.conteudo.includes("Observação"));
  assert.ok(a.conteudo.includes("São João"));
});
test("paginação não perde observações extensas nem as 500 leituras", () => {
  const observacoes = Array.from({ length: 1800 }, (_, i) => "OBS" + i).join(
    " ",
  );
  const leituras = Array.from({ length: 500 }, (_, i) => ({
    profundidade: i + 0.123,
    cota: -i,
    nspt: i % 50,
    solo: "SOLO_UNICO_" + i,
    familia: "Família " + i,
  }));
  const m = normalizarLocacao(
    { ...obra, observacoes },
    [],
    [{ ...sondagens[0], leituras }],
  );
  const layout = calcularLayoutLocacao(m, datas);
  const textos = layout.entidades
    .filter((e) => e.tipo === "texto")
    .map((e) => e.valor)
    .join(" ");
  for (let i = 0; i < 500; i++) assert.ok(textos.includes("SOLO_UNICO_" + i));
  for (let i = 0; i < 1800; i++) assert.ok(textos.includes("OBS" + i));
  const reaberto = new DxfParser().parseSync(
    gerarDxfCompleto(m, datas).conteudo,
  );
  const textoSerializado = reaberto.entities
    .filter((e) => e.type === "MTEXT")
    .map((e) => e.text)
    .join(" ");
  for (let i = 0; i < 500; i++)
    assert.ok(textoSerializado.includes("SOLO_UNICO_" + i));
  for (let i = 0; i < 1800; i++)
    assert.ok(textoSerializado.includes("OBS" + i));
  assert.ok(layout.folhas.length > 10);
  for (let i = 0; i < layout.folhas.length; i++)
    for (let j = i + 1; j < layout.folhas.length; j++) {
      const a = layout.folhas[i],
        b = layout.folhas[j];
      assert.ok(
        a.x + a.largura < b.x ||
          b.x + b.largura < a.x ||
          a.y - a.altura > b.y ||
          b.y - b.altura > a.y,
      );
    }
});
test("sem posição gera quadros sem geometria de locação; obra vazia bloqueada; diâmetro inválido não cria círculo", () => {
  const d = new DxfParser().parseSync(gerar([], [sondagens[1]]).conteudo);
  assert.equal(
    d.entities.filter((e) =>
      [LAYERS.estacas.nome, LAYERS.sondagens.nome].includes(e.layer),
    ).length,
    0,
  );
  assert.throws(() => gerar([], []), /Não há registros/);
  const invalida = new DxfParser().parseSync(
    gerar([{ ...estacas[0], diametroCm: null }], []).conteudo,
  );
  assert.equal(
    invalida.entities.filter(
      (e) => e.type === "CIRCLE" && e.layer === LAYERS.estacas.nome,
    ).length,
    0,
  );
  assert.equal(
    invalida.entities.filter(
      (e) => e.type === "POINT" && e.layer === LAYERS.estacas.nome,
    ).length,
    1,
  );
});
test("coordenadas grandes, precisão, sinais e textos com marcação maliciosa", () => {
  const p = { ...estacas[0], coordX: 700000.123456, coordY: -9000000.654321 };
  const d = new DxfParser().parseSync(gerar([p], []).conteudo);
  const e = d.entities.find(
    (e) => e.type === "CIRCLE" && e.layer === LAYERS.estacas.nome,
  );
  assert.equal(e.center.x, p.coordX);
  assert.equal(e.center.y, p.coordY);
  assert.equal(e.center.z, 0);
  assert.equal(
    escaparMText("\\P {teste} %%d\n0"),
    "\\\\P \\{teste\\} %{}%{}d\\P0",
  );
  assert.match(
    nomeArquivoObra({ ...obra, nome: "../../a\\b:ç?*", numero: "../" }),
    /^[a-zA-Z0-9_-]+\.dxf$/,
  );
});

test("quebras explícitas respeitam largura, Unicode e textos literais", () => {
  const texto = "W".repeat(160) + " áéíÓç ^J %%d {teste}";
  const linhas = quebrarTextoLargura(texto, 28);
  assert.ok(linhas.every((l) => larguraTexto(l) <= 28));
  assert.equal(linhas.join("").replace(/\s/g, ""), texto.replace(/\s/g, ""));
  assert.equal(escaparMText("^J"), "^ J");
});
