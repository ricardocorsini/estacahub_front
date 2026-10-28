import { mkdirSync, writeFileSync } from "node:fs";
import { normalizarLocacao } from "../src/utils/locacao.js";
import { calcularLayoutLocacao } from "../src/utils/dxf/layoutLocacao.js";
import { gerarDxfCompleto } from "../src/utils/dxf/exportarLocacao.js";
import { obra, estacas, sondagens, fixtureAmpla } from "../tests/fixture.js";
const datas = {
  geradoEm: "2026-10-28T18:00:00Z",
  carregadoEm: "2026-10-28T17:55:00Z",
};
mkdirSync("artifacts", { recursive: true });
for (const [nome, dados] of [
  ["fixture", { obra, estacas, sondagens }],
  ["ampla", fixtureAmpla()],
  ["sem-locacao", { obra, estacas: [], sondagens: [sondagens[1]] }],
]) {
  const modelo = normalizarLocacao(dados.obra, dados.estacas, dados.sondagens);
  const resultado = gerarDxfCompleto(modelo, datas);
  writeFileSync("artifacts/" + nome + ".dxf", resultado.conteudo);
  writeFileSync(
    "artifacts/" + nome + "-layout.json",
    JSON.stringify(calcularLayoutLocacao(modelo, datas)),
  );
  writeFileSync("artifacts/" + nome + ".json", JSON.stringify(modelo, null, 2));
  console.log(nome + ": " + JSON.stringify(resultado.resumo));
}
