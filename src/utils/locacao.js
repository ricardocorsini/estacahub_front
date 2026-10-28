import { numero } from "./estacas.js";
import { enquadrarCamera, projetarPonto, temPosicao } from "./locacaoCamera.js";

export function pontosLocacao(estacas, sondagens) {
  return [
    ...estacas.map((estaca, indice) => {
      const diametro = numero(estaca.diametroCm);
      return {
        chave: "estaca-" + (estaca.id ?? indice),
        tipo: "estaca",
        referencia: "E" + String(indice + 1).padStart(3, "0"),
        nome: estaca.nome || "Estaca sem nome",
        x: numero(estaca.coordX),
        y: numero(estaca.coordY),
        raio: diametro != null && diametro > 0 ? diametro / 200 : null,
        dados: estaca,
      };
    }),
    ...sondagens.map((sondagem, indice) => ({
      chave: "sondagem-" + (sondagem.id ?? indice),
      tipo: "sondagem",
      referencia: "S" + String(indice + 1).padStart(3, "0"),
      nome: sondagem.nome || "Sondagem sem nome",
      x: numero(sondagem.dadosCabecalho?.coordX),
      y: numero(sondagem.dadosCabecalho?.coordY),
      raio: null,
      dados: sondagem,
    })),
  ];
}

export function normalizarLocacao(obra, estacas, sondagens) {
  if (!obra || !Array.isArray(estacas) || !Array.isArray(sondagens))
    throw new Error("A consulta da obra está incompleta. Atualize os dados.");
  const pontos = pontosLocacao(estacas, sondagens);
  return {
    obra,
    pontos,
    estacas: pontos.filter((p) => p.tipo === "estaca"),
    sondagens: pontos.filter((p) => p.tipo === "sondagem"),
    localizados: pontos.filter(temPosicao),
    semLocacao: pontos.filter((p) => !temPosicao(p)),
  };
}

// Contrato do minimapa preservado, com a mesma projeção de escala uniforme da planta.
export function enquadrarLocacao(pontos, zoom = 1) {
  const largura = 360,
    altura = 240,
    esquerda = 58,
    topo = 32;
  const validos = pontos.filter(temPosicao);
  const camera = enquadrarCamera(
    validos.length
      ? validos
      : [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
    largura,
    altura,
    0,
  );
  camera.mPorPixel = (Math.max(camera.mPorPixel, 0.015) * 1.3) / zoom;
  return {
    largura,
    altura,
    esquerda,
    topo,
    unidadePorPixel: camera.mPorPixel,
    inicioX: camera.x - (largura * camera.mPorPixel) / 2,
    inicioY: camera.y - (altura * camera.mPorPixel) / 2,
    projetar: (p) => {
      const pos = projetarPonto(p, camera, { largura, altura });
      return { x: pos.x + esquerda, y: pos.y + topo };
    },
  };
}
