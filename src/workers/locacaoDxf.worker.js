import { gerarDxfCompleto } from "../utils/dxf/exportarLocacao.js";
self.onmessage = ({ data }) => {
  try {
    self.postMessage(gerarDxfCompleto(data.modelo, data));
  } catch (erro) {
    self.postMessage({ erro: erro.message || "Falha na geração do desenho." });
  }
};
