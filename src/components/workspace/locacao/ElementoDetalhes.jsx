import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, EyeOff, Focus, X } from "lucide-react";
import { nomeTipoEstaca } from "../../../utils/estacas";
import { temPosicao } from "../../../utils/locacaoCamera";

import { valorCadastro } from "../../../utils/valorCadastro";
export default function ElementoDetalhes({
  ponto,
  obraId,
  visivel,
  coincidentes,
  onSelecionar,
  onFechar,
  onEnquadrar,
  onVisibilidade,
}) {
  const e = ponto.dados,
    s = e.dadosCabecalho || {};
  const campos =
    ponto.tipo === "estaca"
      ? [
          ["Tipo", nomeTipoEstaca(e.tipo)],
          ["Diâmetro externo (cm)", e.diametroCm],
          ["Capacidade estrutural cadastrada (tf)", e.capacidadeEstruturalTf],
          ["Carga prevista (tf)", e.cargaPrevistaTf],
          ["Cota de arrasamento (m)", e.cotaArrasamento],
        ]
      : [
          ["Cota da boca (m)", s.cotaBoca],
          ["Profundidade final (m)", s.profundidadeFinal],
          ["Critério", s.criterio],
          ["Nível de água (m)", s.nivelAgua],
          ["Leituras cadastradas", e.leituras?.length ?? 0],
        ];
  return (
    <aside
      className="loc-inspector"
      aria-label="Detalhes do elemento selecionado"
    >
      <header>
        <div>
          <span className={"loc-kind loc-kind-" + ponto.tipo}>
            {ponto.tipo === "estaca" ? "ESTACA" : "SONDAGEM"} ·{" "}
            {ponto.referencia}
          </span>
          <h2>{ponto.nome}</h2>
        </div>
        <button
          className="loc-icon"
          aria-label="Fechar detalhes"
          onClick={onFechar}
        >
          <X size={17} />
        </button>
      </header>
      {!temPosicao(ponto) && (
        <p className="loc-warning">
          Sem locação. Informe X e Y no cadastro para representar este elemento.
        </p>
      )}
      {!visivel && temPosicao(ponto) && (
        <p className="loc-muted">
          Elemento oculto pelas camadas ou visibilidade individual.
        </p>
      )}
      <div className="loc-xy">
        <div>
          <span>X (m)</span>
          <strong>{valorCadastro(ponto.x)}</strong>
        </div>
        <div>
          <span>Y (m)</span>
          <strong>{valorCadastro(ponto.y)}</strong>
        </div>
      </div>
      <dl>
        {campos.map(([nome, valor]) => (
          <div key={nome}>
            <dt>{nome}</dt>
            <dd>{valorCadastro(valor)}</dd>
          </div>
        ))}
        <div>
          <dt>Identificador</dt>
          <dd>{valorCadastro(e.id)}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{valorCadastro(e.criadoEm)}</dd>
        </div>
        <div>
          <dt>Atualizado em</dt>
          <dd>{valorCadastro(e.atualizadoEm)}</dd>
        </div>
      </dl>
      {coincidentes.length > 1 && (
        <div className="loc-coincidentes">
          <h3>{coincidentes.length} elementos nesta coordenada</h3>
          <p>Centros preservados. Selecione para consultar:</p>
          {coincidentes.map((p) => (
            <button
              key={p.chave}
              onClick={() => onSelecionar(p.chave)}
              aria-pressed={p.chave === ponto.chave}
            >
              {p.referencia} · {p.nome}
            </button>
          ))}
        </div>
      )}
      <p className="loc-muted">
        Cotas de boca e arrasamento são altimétricas. A planta representa
        somente X/Y.
      </p>
      <div className="loc-detail-actions">
        <button
          className="loc-button"
          disabled={!temPosicao(ponto)}
          onClick={onEnquadrar}
        >
          <Focus size={15} /> Enquadrar elemento
        </button>
        <button className="loc-button" onClick={onVisibilidade}>
          {visivel ? <EyeOff size={15} /> : <Eye size={15} />}{" "}
          {visivel ? "Ocultar" : "Mostrar"} no mapa
        </button>
        <Link
          to={
            "/obras/" +
            obraId +
            (ponto.tipo === "estaca" ? "/cadastro-estacas" : "/sondagens")
          }
        >
          Abrir cadastro <ArrowUpRight size={14} />
        </Link>
      </div>
      {ponto.tipo === "sondagem" && (
        <details className="loc-readings">
          <summary>Leituras da sondagem ({e.leituras?.length ?? 0})</summary>
          <div tabIndex={0} role="region" aria-label="Tabela de leituras">
            <table>
              <thead>
                <tr>
                  {["Prof. (m)", "Cota (m)", "NSPT", "Solo", "Família"].map(
                    (v) => (
                      <th key={v}>{v}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(e.leituras || []).map((l, i) => (
                  <tr key={l.id ?? i}>
                    {["profundidade", "cota", "nspt", "solo", "familia"].map(
                      (c) => (
                        <td key={c}>{valorCadastro(l[c])}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </aside>
  );
}
