// Câmera em metros; a inversão de Y pertence somente à projeção de tela.
export const MIN_M_PX = 0.00001;
export const MAX_M_PX = 100000000;
export const temPosicao = (p) => Number.isFinite(p.x) && Number.isFinite(p.y);

export function limitesLocacao(pontos, incluirRaios = false) {
  let limites = null;
  for (const p of pontos) {
    if (!temPosicao(p)) continue;
    const r = incluirRaios && Number.isFinite(p.raio) ? p.raio : 0;
    if (!limites)
      limites = { minX: p.x - r, maxX: p.x + r, minY: p.y - r, maxY: p.y + r };
    else {
      limites.minX = Math.min(limites.minX, p.x - r);
      limites.maxX = Math.max(limites.maxX, p.x + r);
      limites.minY = Math.min(limites.minY, p.y - r);
      limites.maxY = Math.max(limites.maxY, p.y + r);
    }
  }
  return limites;
}

const limitarEscala = (s) => Math.min(MAX_M_PX, Math.max(MIN_M_PX, s));
export function enquadrarCamera(pontos, largura, altura, margem = 68) {
  const b = limitesLocacao(pontos, true);
  if (!b) return { x: 0, y: 0, mPorPixel: 0.025 };
  const dx = b.maxX - b.minX,
    dy = b.maxY - b.minY;
  return {
    x: b.minX + dx / 2,
    y: b.minY + dy / 2,
    mPorPixel: limitarEscala(
      Math.max(
        dx / Math.max(40, largura - 2 * margem),
        dy / Math.max(40, altura - 2 * margem),
        0.01,
      ),
    ),
  };
}
export function projetarPonto(p, camera, viewport) {
  return {
    x: viewport.largura / 2 + (p.x - camera.x) / camera.mPorPixel,
    y: viewport.altura / 2 - (p.y - camera.y) / camera.mPorPixel,
  };
}
export function desprojetarPonto(p, camera, viewport) {
  return {
    x: camera.x + (p.x - viewport.largura / 2) * camera.mPorPixel,
    y: camera.y - (p.y - viewport.altura / 2) * camera.mPorPixel,
  };
}
export function moverCamera(camera, dx, dy) {
  return {
    ...camera,
    x: camera.x - dx * camera.mPorPixel,
    y: camera.y + dy * camera.mPorPixel,
  };
}
export function zoomCamera(camera, fator, ancora, viewport) {
  const mundo = desprojetarPonto(ancora, camera, viewport);
  const mPorPixel = limitarEscala(camera.mPorPixel / fator);
  return {
    mPorPixel,
    x: mundo.x - (ancora.x - viewport.largura / 2) * mPorPixel,
    y: mundo.y + (ancora.y - viewport.altura / 2) * mPorPixel,
  };
}
export function passoGrade(alvo) {
  if (!(alvo > 0) || !Number.isFinite(alvo)) return 1;
  const potencia = 10 ** Math.floor(Math.log10(alvo));
  const razao = alvo / potencia;
  return (razao <= 1 ? 1 : razao <= 2 ? 2 : razao <= 5 ? 5 : 10) * potencia;
}
export function marcasGrade(min, max, passo, limite = 80) {
  const inicio = Math.ceil(min / passo);
  const quantidade = Math.min(
    limite,
    Math.max(0, Math.floor(max / passo) - inicio + 1),
  );
  return Array.from({ length: quantidade }, (_, i) => (inicio + i) * passo);
}
