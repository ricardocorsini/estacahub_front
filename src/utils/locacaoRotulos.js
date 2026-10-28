// Posicionamento compartilhado em pixels; o texto pode mudar, o centro nunca.
export function posicionarRotulos(
  pontos,
  {
    esquerda = 8,
    topo = 24,
    direita,
    fundo,
    reservadas = [],
    medirTexto,
    maxCaracteres = 23,
  },
) {
  const caixas = [
    ...reservadas,
    ...pontos.map((p) => ({
      x: p.pos.x - (p.raioPixels ?? 9),
      y: p.pos.y - (p.raioPixels ?? 9),
      w: 2 * (p.raioPixels ?? 9),
      h: 2 * (p.raioPixels ?? 9),
    })),
  ];
  return pontos.map((p) => {
    const texto =
      p.nome.length > maxCaracteres
        ? p.nome.slice(0, maxCaracteres - 1) + "…"
        : p.nome;
    const largura = Math.min(
      Math.max(32, (medirTexto ? medirTexto(texto) : texto.length * 6.5) + 10),
      Math.max(32, direita - esquerda),
    );
    const alternativas = [
      [14, -14],
      [14, 25],
      [-largura - 14, -14],
      [-largura - 14, 25],
      [14, -34],
      [14, 45],
      [-largura - 14, -34],
      [-largura - 14, 45],
    ];
    for (const [dx, dy] of alternativas) {
      const x = Math.max(esquerda, Math.min(p.pos.x + dx, direita - largura));
      const y = Math.max(topo, Math.min(p.pos.y + dy, fundo));
      const caixa = { x: x - 3, y: y - 13, w: largura + 6, h: 19 };
      if (
        !caixas.some(
          (c) =>
            c.x < caixa.x + caixa.w &&
            c.x + c.w > caixa.x &&
            c.y < caixa.y + caixa.h &&
            c.y + c.h > caixa.y,
        )
      ) {
        caixas.push(caixa);
        return { ...p, rotulo: { x, y }, texto, larguraRotulo: largura };
      }
    }
    // Em áreas densas, evite empilhar textos ilegíveis. Lista e tooltip preservam o nome inteiro.
    return { ...p, rotulo: null, texto, larguraRotulo: largura };
  });
}
