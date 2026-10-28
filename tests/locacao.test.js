import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizarLocacao,
  pontosLocacao,
  enquadrarLocacao,
} from "../src/utils/locacao.js";
import { numero } from "../src/utils/estacas.js";
import {
  temPosicao,
  enquadrarCamera,
  projetarPonto,
  desprojetarPonto,
  zoomCamera,
  moverCamera,
  marcasGrade,
  passoGrade,
} from "../src/utils/locacaoCamera.js";
import { posicionarRotulos } from "../src/utils/locacaoRotulos.js";
import { obra, estacas, sondagens } from "./fixture.js";

test("ausências não viram zero; X e Y finitos obrigatórios; diâmetro cm → raio m", () => {
  for (const v of [
    null,
    undefined,
    "",
    " ",
    false,
    true,
    NaN,
    Infinity,
    "NaN",
    {},
    [1],
  ])
    assert.equal(numero(v), null);
  assert.equal(numero(0), 0);
  assert.equal(numero("-5,123456"), -5.123456);
  const m = normalizarLocacao(obra, estacas, sondagens);
  assert.equal(m.localizados.length, 3);
  assert.equal(m.semLocacao.length, 1);
  assert.equal(m.estacas[0].raio, 0.2);
  assert.equal(m.semLocacao[0].x, -5.123456);
  assert.equal(m.semLocacao[0].y, null);
  assert.ok(temPosicao(m.estacas[0]));
  assert.throws(() => normalizarLocacao(null, [], []));
});
test("câmera uniforme, inversão restrita à tela e distância 3/4/5", () => {
  const v = { largura: 1240, altura: 680 },
    pontos = pontosLocacao(estacas, []),
    c = enquadrarCamera(pontos, v.largura, v.altura);
  const a = projetarPonto(pontos[0], c, v),
    b = projetarPonto(pontos[1], c, v);
  assert.ok(
    Math.abs(Math.hypot(b.x - a.x, b.y - a.y) * c.mPorPixel - 5) < 1e-10,
  );
  assert.ok(b.y < a.y);
  const origem = desprojetarPonto(a, c, v);
  assert.ok(Math.abs(origem.x) < 1e-12 && Math.abs(origem.y) < 1e-12);
  const m = enquadrarLocacao(pontos);
  assert.ok(Number.isFinite(m.projetar(pontos[0]).x));
});
test("zoom ancorado, pan e limites seguros; coordenadas grandes e negativas", () => {
  const v = { largura: 1000, altura: 620 },
    c = { x: 700000.123456, y: 9000000.654321, mPorPixel: 0.02 },
    ancora = { x: 117, y: 320 };
  const antes = desprojetarPonto(ancora, c, v),
    depois = desprojetarPonto(ancora, zoomCamera(c, 2, ancora, v), v);
  assert.deepEqual(depois, antes);
  assert.equal(moverCamera(c, 10, 10).x, c.x - 0.2);
  for (const fator of [1e100, 1e-100])
    assert.ok(Number.isFinite(zoomCamera(c, fator, ancora, v).mPorPixel));
  const p = { x: -99999999.123456, y: 99999999.654321 };
  const c2 = enquadrarCamera([p], 400, 500);
  assert.deepEqual(desprojetarPonto(projetarPonto(p, c2, v), c2, v), p);
});
test("vazio, ponto, alinhados e coincidentes sempre têm câmera finita e grade limitada", () => {
  for (const ps of [
    [],
    [{ x: 0, y: 0 }],
    [
      { x: 0, y: 0 },
      { x: 0, y: 20 },
    ],
    [
      { x: -3, y: 4 },
      { x: -3, y: 4 },
    ],
  ]) {
    const c = enquadrarCamera(ps, 320, 500);
    assert.ok(Object.values(c).every(Number.isFinite));
    assert.ok(c.mPorPixel > 0);
  }
  assert.ok(marcasGrade(-1e12, 1e12, 0.0001).length <= 80);
  assert.ok(passoGrade(0) > 0);
});
test("rótulos densos não movem centros nem criam caixas sobrepostas", () => {
  const pontos = Array.from({ length: 40 }, (_, i) => ({
    nome: "Elemento " + i,
    pos: { x: 150, y: 150 },
    x: 0,
    y: 0,
  }));
  const labels = posicionarRotulos(pontos, {
    esquerda: 10,
    topo: 20,
    direita: 350,
    fundo: 350,
  });
  assert.ok(labels.some((p) => !p.rotulo));
  assert.ok(labels.every((p) => p.x === 0 && p.y === 0 && p.pos.x === 150));
});
