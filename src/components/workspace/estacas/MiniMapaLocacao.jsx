import { useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LocateFixed,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { formatarNumero, nomeTipoEstaca } from "../../../utils/estacas";
import { enquadrarLocacao, pontosLocacao } from "../../../utils/locacao";

export default function MiniMapaLocacao({
  obraId,
  estacas,
  sondagens,
  selecao,
  onSelecionar,
  onAdicionar,
  onEditar,
  onExcluir,
  ocupado,
  erroSondagens,
  onRecarregarSondagens,
}) {
  const clipId = useId();
  const [mostrarEstacas, setMostrarEstacas] = useState(true);
  const [mostrarSondagens, setMostrarSondagens] = useState(true);
  const [mostrarNomes, setMostrarNomes] = useState(true);
  const [ocultos, setOcultos] = useState(() => new Set());
  const [zoom, setZoom] = useState(1);
  const pontos = pontosLocacao(estacas, sondagens);
  const semCoordenadas = pontos.filter(
    (ponto) => ponto.x == null || ponto.y == null,
  );
  const ocultosAtuais = pontos.filter((ponto) => ocultos.has(ponto.chave));
  const visiveis = pontos.filter(
    (p) =>
      p.x != null &&
      p.y != null &&
      !ocultos.has(p.chave) &&
      (p.tipo === "estaca" ? mostrarEstacas : mostrarSondagens),
  );
  const selecionado = pontos.find((p) => p.chave === selecao);
  const quadro = enquadrarLocacao(visiveis, zoom);
  const origemX =
    Math.abs(quadro.inicioX) >= 10000
      ? Math.floor(quadro.inicioX / 100) * 100
      : 0;
  const origemY =
    Math.abs(quadro.inicioY) >= 10000
      ? Math.floor(quadro.inicioY / 100) * 100
      : 0;

  function ocultarSelecionado() {
    if (!selecionado) return;
    setOcultos((atuais) => new Set([...atuais, selecionado.chave]));
    onSelecionar(null);
  }

  // Posiciona rótulos em alternativas simples, evitando sobreposição entre nomes.
  const caixas = [{ x: 325, y: 0, w: 131, h: 62 }];
  const pontosDesenhados = visiveis.map((p) => {
    const pos = quadro.projetar(p);
    const largura = Math.min(138, p.nome.length * 6.2 + 10);
    const alternativas = [
      [12, -12],
      [12, 19],
      [-largura - 10, -12],
      [-largura - 10, 19],
      [12, -30],
      [12, 37],
    ];
    let rotulo = { x: pos.x + 12, y: pos.y - 12 };
    for (const [dx, dy] of alternativas) {
      const x = Math.max(60, Math.min(pos.x + dx, 416 - largura));
      const y = Math.max(45, Math.min(pos.y + dy, 266));
      const caixa = { x, y: y - 12, w: largura, h: 16 };
      if (
        !caixas.some(
          (c) =>
            c.x < caixa.x + caixa.w &&
            c.x + c.w > caixa.x &&
            c.y < caixa.y + caixa.h &&
            c.y + c.h > caixa.y,
        )
      ) {
        rotulo = { x, y };
        caixas.push(caixa);
        break;
      }
    }
    return { ...p, pos, rotulo, larguraRotulo: largura };
  });

  return (
    <aside
      className="estacas-card estacas-map-card"
      aria-labelledby="mini-mapa-title"
    >
      <header className="estacas-card-header">
        <div>
          <span className="estacas-eyebrow">LOCAÇÃO EM PLANTA</span>
          <h2 id="mini-mapa-title">Mini-mapa de locação</h2>
          <p>Estacas e furos no mesmo plano X/Y.</p>
        </div>
        <MapPin size={19} />
      </header>

      <div className="estacas-map-stats">
        <span>
          <i className="estacas-dot" />
          <strong>{estacas.length}</strong> estacas
        </span>
        <span>
          <i className="estacas-triangle" />
          <strong>{sondagens.length}</strong> furos
        </span>
      </div>

      {erroSondagens && (
        <div className="estacas-notice estacas-notice-warning" role="status">
          {erroSondagens}
          <button
            type="button"
            className="estacas-text-button"
            onClick={onRecarregarSondagens}
          >
            Tentar carregar furos novamente
          </button>
        </div>
      )}

      <div className="estacas-map-toolbar" aria-label="Camadas do mini-mapa">
        <label>
          <input
            type="checkbox"
            checked={mostrarEstacas}
            onChange={(e) => setMostrarEstacas(e.target.checked)}
          />
          Estacas
        </label>
        <label>
          <input
            type="checkbox"
            checked={mostrarSondagens}
            onChange={(e) => setMostrarSondagens(e.target.checked)}
          />
          Furos
        </label>
        <label>
          <input
            type="checkbox"
            checked={mostrarNomes}
            onChange={(e) => setMostrarNomes(e.target.checked)}
          />
          Nomes
        </label>
      </div>

      <div className="estacas-map-canvas">
        <div className="estacas-map-zoom" aria-label="Zoom do mapa">
          <button
            type="button"
            aria-label="Ampliar mapa"
            disabled={zoom >= 8}
            onClick={() => setZoom((z) => Math.min(8, z * 1.4))}
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            aria-label="Reduzir mapa"
            disabled={zoom <= 0.4}
            onClick={() => setZoom((z) => Math.max(0.4, z / 1.4))}
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            aria-label="Enquadrar todos os pontos visíveis"
            onClick={() => setZoom(1)}
          >
            <LocateFixed size={15} />
          </button>
        </div>
        <svg
          viewBox="0 0 456 320"
          className="estacas-map-svg"
          role="group"
          aria-label="Planta de locação das estacas e sondagens em metros"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="54" y="28" width="368" height="248" />
            </clipPath>
          </defs>
          {[0, 1, 2, 3, 4].map((n) => {
            const x = quadro.esquerda + (quadro.largura * n) / 4;
            const y = quadro.topo + (quadro.altura * n) / 4;
            return (
              <g key={n} className="estacas-map-grid">
                <line x1={x} x2={x} y1={32} y2={272} />
                <line x1={58} x2={418} y1={y} y2={y} />
                <text x={x} y={291} textAnchor="middle">
                  {formatarNumero(
                    quadro.inicioX -
                      origemX +
                      ((quadro.largura * n) / 4) * quadro.unidadePorPixel,
                    1,
                  )}
                </text>
                <text x={49} y={y + 3} textAnchor="end">
                  {formatarNumero(
                    quadro.inicioY -
                      origemY +
                      quadro.altura * (1 - n / 4) * quadro.unidadePorPixel,
                    1,
                  )}
                </text>
              </g>
            );
          })}
          <text x={420} y={312} className="estacas-map-axis" textAnchor="end">
            X (m)
          </text>
          <text x={16} y={17} className="estacas-map-axis">
            Y (m)
          </text>
          <g clipPath={`url(#${clipId})`}>
            {pontosDesenhados.map((p) => (
              <g
                key={p.chave}
                role="button"
                tabIndex={0}
                aria-label={`${p.tipo === "estaca" ? "Estaca" : "Sondagem"} ${p.nome}, X ${p.x}, Y ${p.y}`}
                aria-pressed={selecao === p.chave}
                className="estacas-map-marker"
                onClick={() => onSelecionar(p.chave)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelecionar(p.chave);
                  }
                }}
              >
                <title>
                  {p.nome} · X {formatarNumero(p.x, 3)} m · Y{" "}
                  {formatarNumero(p.y, 3)} m
                </title>
                {mostrarNomes && (
                  <rect
                    x={Math.min(p.pos.x - 15, p.rotulo.x - 4)}
                    y={Math.min(p.pos.y - 15, p.rotulo.y - 12)}
                    width={
                      Math.max(p.pos.x + 15, p.rotulo.x + p.larguraRotulo) -
                      Math.min(p.pos.x - 15, p.rotulo.x - 4)
                    }
                    height={
                      Math.max(p.pos.y + 15, p.rotulo.y + 4) -
                      Math.min(p.pos.y - 15, p.rotulo.y - 12)
                    }
                    fill="transparent"
                    pointerEvents="all"
                  />
                )}
                <circle
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={15}
                  fill={
                    selecao === p.chave
                      ? p.tipo === "estaca"
                        ? "#ede9fe"
                        : "#ccfbf1"
                      : "transparent"
                  }
                />
                {p.tipo === "estaca" ? (
                  <circle
                    cx={p.pos.x}
                    cy={p.pos.y}
                    r={6}
                    fill="#7c3aed"
                    stroke="white"
                    strokeWidth={2}
                  />
                ) : (
                  <path
                    d={`M ${p.pos.x} ${p.pos.y - 8} l 8 14 h -16 Z`}
                    fill="#0d9488"
                    stroke="white"
                    strokeWidth={2}
                  />
                )}
                {mostrarNomes && (
                  <text
                    x={p.rotulo.x}
                    y={p.rotulo.y}
                    className={`estacas-map-label ${p.tipo === "sondagem" ? "estacas-map-label-sondagem" : ""}`}
                  >
                    {p.nome.length > 20 ? `${p.nome.slice(0, 18)}…` : p.nome}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
        {!visiveis.length && (
          <div className="estacas-map-empty">
            <MapPin size={24} />
            <p>Nenhum ponto visível</p>
            <span>
              Adicione uma estaca ou informe as coordenadas dos furos.
            </span>
          </div>
        )}
      </div>
      <p className="estacas-map-caption">
        Escala igual nos eixos · Símbolos sem escala de diâmetro.
      </p>
      {(origemX !== 0 || origemY !== 0) && (
        <p className="estacas-map-caption">
          Eixos relativos à origem X = {formatarNumero(origemX, 0)} m / Y ={" "}
          {formatarNumero(origemY, 0)} m.
        </p>
      )}

      {semCoordenadas.length > 0 && (
        <p className="estacas-map-note">
          Sem coordenadas: {semCoordenadas.map((p) => p.nome).join(", ")}.
          Complete X/Y no cadastro para exibir no mapa.
        </p>
      )}
      {ocultosAtuais.length > 0 && (
        <div className="estacas-hidden-points">
          <span>{ocultosAtuais.length} ponto(s) oculto(s)</span>
          <button
            type="button"
            className="estacas-text-button"
            onClick={() => setOcultos(new Set())}
          >
            <Eye size={13} /> Restaurar pontos
          </button>
        </div>
      )}

      <div className="estacas-map-selection">
        <label htmlFor="estacas-mapa-ponto">Consultar ponto</label>
        <select
          id="estacas-mapa-ponto"
          value={selecionado?.chave || ""}
          onChange={(e) => onSelecionar(e.target.value || null)}
        >
          <option value="">Clique no mapa ou selecione aqui</option>
          {pontos.map((p) => (
            <option key={p.chave} value={p.chave}>
              {p.tipo === "estaca" ? "Estaca" : "Furo"} · {p.nome}
            </option>
          ))}
        </select>
        {selecionado ? (
          <div className="estacas-point-details">
            <div className="estacas-point-title">
              <strong>{selecionado.nome}</strong>
              <span>
                {selecionado.tipo === "estaca" ? "Estaca" : "Furo de sondagem"}
              </span>
            </div>
            <dl>
              <div>
                <dt>X / Y (m)</dt>
                <dd>
                  {formatarNumero(selecionado.x, 3)} /{" "}
                  {formatarNumero(selecionado.y, 3)}
                </dd>
              </div>
              {selecionado.tipo === "estaca" ? (
                <>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{nomeTipoEstaca(selecionado.dados.tipo)}</dd>
                  </div>
                  <div>
                    <dt>Diâmetro</dt>
                    <dd>{formatarNumero(selecionado.dados.diametroCm)} cm</dd>
                  </div>
                  <div>
                    <dt>Capacidade / prevista</dt>
                    <dd>
                      {formatarNumero(selecionado.dados.capacidadeEstruturalTf)}{" "}
                      / {formatarNumero(selecionado.dados.cargaPrevistaTf)} tf
                    </dd>
                  </div>
                  <div>
                    <dt>Arrasamento</dt>
                    <dd>
                      {formatarNumero(selecionado.dados.cotaArrasamento, 3)} m
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>Cota da boca</dt>
                    <dd>
                      {formatarNumero(
                        selecionado.dados.dadosCabecalho?.cotaBoca,
                        3,
                      )}{" "}
                      m
                    </dd>
                  </div>
                  <div>
                    <dt>Profundidade final</dt>
                    <dd>
                      {formatarNumero(
                        selecionado.dados.dadosCabecalho?.profundidadeFinal,
                      )}{" "}
                      m
                    </dd>
                  </div>
                  <div>
                    <dt>Nível de água</dt>
                    <dd>
                      {formatarNumero(
                        selecionado.dados.dadosCabecalho?.nivelAgua,
                      )}{" "}
                      m
                    </dd>
                  </div>
                  <div>
                    <dt>Leituras cadastradas</dt>
                    <dd>{selecionado.dados.leituras?.length ?? 0}</dd>
                  </div>
                </>
              )}
            </dl>
            <div className="estacas-point-actions">
              <button
                type="button"
                className="estacas-text-button"
                onClick={ocultarSelecionado}
              >
                <EyeOff size={13} /> Ocultar no mapa
              </button>
              {selecionado.tipo === "estaca" ? (
                <>
                  <button
                    type="button"
                    className="estacas-text-button"
                    disabled={ocupado}
                    onClick={() => onEditar(selecionado.dados)}
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    className="estacas-text-button estacas-danger"
                    disabled={ocupado}
                    onClick={() => onExcluir(selecionado.dados)}
                  >
                    <Trash2 size={13} /> Excluir estaca
                  </button>
                </>
              ) : (
                <Link
                  className="estacas-text-button"
                  to={`/obras/${obraId}/sondagens`}
                >
                  <Pencil size={13} /> Editar furo
                </Link>
              )}
            </div>
          </div>
        ) : (
          <p className="estacas-hint">
            Selecione um ponto para consultar seus dados.
          </p>
        )}
      </div>

      <footer className="estacas-map-footer">
        <button
          type="button"
          className="estacas-button"
          disabled={ocupado}
          onClick={onAdicionar}
        >
          <Plus size={14} /> Adicionar estaca
        </button>
        <Link className="estacas-button" to={`/obras/${obraId}/sondagens`}>
          <Plus size={14} /> Adicionar furo
        </Link>
      </footer>
    </aside>
  );
}
