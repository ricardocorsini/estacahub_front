import { numero } from "./estacas.js";

export function pontosLocacao(estacas, sondagens) {
  return [
    ...estacas.map((estaca) => ({
      chave: `estaca-${estaca.id}`,
      tipo: "estaca",
      nome: estaca.nome,
      x: numero(estaca.coordX),
      y: numero(estaca.coordY),
      dados: estaca,
    })),
    ...sondagens.map((sondagem) => ({
      chave: `sondagem-${sondagem.id}`,
      tipo: "sondagem",
      nome: sondagem.nome,
      x: numero(sondagem.dadosCabecalho?.coordX),
      y: numero(sondagem.dadosCabecalho?.coordY),
      dados: sondagem,
    })),
  ];
}

// Mesma escala em X/Y. Usa diferenças relativas para coordenadas UTM grandes.
export function enquadrarLocacao(pontos, zoom = 1) {
  const validos = pontos.filter((ponto) => ponto.x != null && ponto.y != null);
  let minX = 0,
    maxX = 10,
    minY = 0,
    maxY = 10;
  if (validos.length) {
    minX = maxX = validos[0].x;
    minY = maxY = validos[0].y;
    for (const p of validos) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }
  const largura = 360,
    altura = 240,
    esquerda = 58,
    topo = 32;
  const cx = (minX + maxX) / 2,
    cy = (minY + maxY) / 2;
  const unidadePorPixel =
    (Math.max((maxX - minX) / largura, (maxY - minY) / altura, 0.015) * 1.3) /
    zoom;
  const inicioX = cx - (largura * unidadePorPixel) / 2;
  const inicioY = cy - (altura * unidadePorPixel) / 2;
  return {
    largura,
    altura,
    esquerda,
    topo,
    unidadePorPixel,
    inicioX,
    inicioY,
    projetar: (p) => ({
      x: esquerda + (p.x - inicioX) / unidadePorPixel,
      y: topo + altura - (p.y - inicioY) / unidadePorPixel,
    }),
  };
}
