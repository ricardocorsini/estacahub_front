import { Eye, EyeOff, Search, X } from "lucide-react";
import { temPosicao } from "../../../utils/locacaoCamera";

export default function PainelElementos({
  pontos,
  camadas,
  setCamadas,
  ocultos,
  onAlternar,
  selecao,
  onSelecionar,
  busca,
  setBusca,
  filtro,
  setFiltro,
  onRestaurar,
  onFechar,
  visivel,
}) {
  const termo = busca.toLocaleLowerCase("pt-BR");
  const filtrados = pontos.filter(
    (p) =>
      (p.nome + " " + p.referencia)
        .toLocaleLowerCase("pt-BR")
        .includes(termo) &&
      (filtro === "todos" ||
        (filtro === "sem" && !temPosicao(p)) ||
        filtro === p.tipo),
  );
  return (
    <aside
      className="loc-panel"
      id="loc-elementos"
      aria-label="Camadas e elementos"
    >
      <header>
        <h2>Camadas e elementos</h2>
        <button
          className="loc-icon"
          aria-label="Recolher painel"
          onClick={onFechar}
        >
          <X size={17} />
        </button>
      </header>
      <fieldset>
        <legend>Camadas da planta</legend>
        <div className="loc-layer-grid">
          {[
            ["estaca", "Estacas"],
            ["sondagem", "Sondagens"],
            ["nomes", "Nomes"],
            ["grade", "Grade / referência"],
            ["cotas", "Cotas de locação"],
          ].map(([chave, nome]) => (
            <label key={chave}>
              <input
                type="checkbox"
                checked={camadas[chave]}
                onChange={(e) =>
                  setCamadas((c) => ({ ...c, [chave]: e.target.checked }))
                }
              />
              {nome}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="loc-panel-search">
        <Search size={15} />
        <input
          aria-label="Pesquisar elementos"
          placeholder="Nome ou referência…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <label className="workspace-sr-only" htmlFor="loc-filtro">
        Filtrar lista de elementos
      </label>
      <select
        id="loc-filtro"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      >
        <option value="todos">Todos os elementos ({pontos.length})</option>
        <option value="estaca">Estacas</option>
        <option value="sondagem">Sondagens</option>
        <option value="sem">Sem locação</option>
      </select>
      <p className="loc-list-caption">
        {filtrados.length} na lista · {pontos.filter(visivel).length} na planta
      </p>
      <ul className="loc-element-list">
        {filtrados.map((p) => (
          <li
            key={p.chave}
            className={selecao === p.chave ? "loc-list-selected" : ""}
          >
            <button
              className="loc-element-select"
              onClick={() => onSelecionar(p.chave)}
              aria-pressed={selecao === p.chave}
            >
              <span className={"loc-symbol loc-symbol-" + p.tipo} />
              <span>
                <strong>{p.nome}</strong>
                <small>
                  {p.referencia} ·{" "}
                  {temPosicao(p)
                    ? visivel(p)
                      ? "Localizado"
                      : "Oculto"
                    : "Sem locação"}
                </small>
              </span>
            </button>
            <button
              className="loc-icon"
              aria-label={
                (ocultos.has(p.chave) ? "Mostrar " : "Ocultar ") + p.nome
              }
              aria-pressed={!ocultos.has(p.chave)}
              onClick={() => onAlternar(p.chave)}
            >
              {ocultos.has(p.chave) ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </li>
        ))}
      </ul>
      {!filtrados.length && (
        <p className="loc-list-empty">Nenhum elemento encontrado.</p>
      )}
      <footer>
        <button onClick={onRestaurar}>Restaurar camadas e elementos</button>
        <p>
          Filtros afetam a apresentação. O DXF inclui toda a obra carregada.
        </p>
      </footer>
    </aside>
  );
}
