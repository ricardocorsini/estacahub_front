import { calcularLayoutLocacao } from "./layoutLocacao.js";
import { serializarDxf } from "./serializarDxf.js";
import { nomeArquivoObra } from "./texto.js";

export function gerarDxfCompleto(
  modelo,
  { geradoEm = new Date().toISOString(), carregadoEm } = {},
) {
  const layout = calcularLayoutLocacao(modelo, { geradoEm, carregadoEm });
  return {
    conteudo: serializarDxf(layout),
    nomeArquivo: nomeArquivoObra(modelo.obra),
    resumo: {
      registros: modelo.pontos.length,
      localizados: modelo.localizados.length,
      semLocacao: modelo.semLocacao.length,
      folhas: layout.folhas.length,
      dimensoes: layout.dimensoes.length,
    },
  };
}
