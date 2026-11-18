import { useEffect, useId, useRef, useState } from "react";

import { cargaFinal, cotaEmMetros, METODOS_CARGA, textoCarga } from "../../../utils/cargaAdmissivel";

const ALTURA = 338;
const formatoEscala = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const formatoEscalaCompacta = new Intl.NumberFormat("pt-BR", {
  notation: "compact", maximumFractionDigits: 1,
});

function formatarMarca(valor) {
  return (Math.abs(valor) >= 10000 ? formatoEscalaCompacta : formatoEscala).format(valor);
}

function passoDeEscala(intervalo) {
  if (intervalo <= 0) return 1;
  const ordem = 10 ** Math.floor(Math.log10(intervalo));
  const fator = [1, 2, 2.5, 5, 10].find((item) => item * ordem >= intervalo);
  return fator * ordem;
}

export default function CurvaCarga({ curva, cota, cargaPrevista, unidade, onSelecionar }) {
  const aresta = useRef(null);
  const ajudaId = useId();
  const [largura, setLargura] = useState(560);
  const [cotaSobCursor, setCotaSobCursor] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entrada]) => {
      setLargura(Math.max(1, Math.round(entrada.contentRect.width)));
    });
    observer.observe(aresta.current);
    return () => observer.disconnect();
  }, []);

  const topo = 19;
  const base = ALTURA - 49;
  const cotaMax = curva[0].cotaPontaM;
  const cotaMin = curva.at(-1).cotaPontaM;
  const intervaloCota = cotaMax - cotaMin;
  const esquerda = 38 + Math.max(formatarMarca(cotaMax).length, formatarMarca(cotaMin).length) * 7;
  const direita = largura - 18;
  const maiorCarga = Math.max(
    cargaPrevista ?? 0,
    ...curva.flatMap((ponto) => METODOS_CARGA.map(({ chave }) => cargaFinal(ponto[chave], unidade))),
  ) || 1;
  const passoX = passoDeEscala(maiorCarga / (largura >= 470 ? 5 : 3));
  const intervalosX = Math.ceil(maiorCarga / passoX);
  const maxX = intervalosX * passoX;
  const passoY = Math.max(1, Math.ceil(passoDeEscala(intervaloCota / 6)));
  const marcasX = Array.from({ length: intervalosX + 1 }, (_, i) => passoX * i);
  const marcasY = Array.from({ length: Math.floor(intervaloCota / passoY) + 1 }, (_, i) => cotaMax - passoY * i);
  const x = (valor) => esquerda + valor / maxX * Math.max(1, direita - esquerda);
  const y = (valor) => intervaloCota > 0
    ? topo + (cotaMax - valor) / intervaloCota * (base - topo)
    : (topo + base) / 2;
  const indice = curva.findIndex((ponto) => ponto.cotaPontaM === cota);
  const selecionado = curva[indice];

  function selecionarPeloTeclado(event) {
    const indices = { ArrowUp: indice - 1, ArrowDown: indice + 1, Home: 0, End: curva.length - 1 };
    const proximo = indices[event.key];
    if (proximo == null) return;
    event.preventDefault();
    if (curva[proximo]) onSelecionar(curva[proximo].cotaPontaM);
  }

  function cotaDoPonteiro(event) {
    const caixa = event.currentTarget.getBoundingClientRect();
    const vertical = (event.clientY - caixa.top) * ALTURA / caixa.height;
    const horizontal = (event.clientX - caixa.left) * largura / caixa.width;
    if (vertical < topo || vertical > base || horizontal < esquerda || horizontal > direita) return null;
    const cotaAlvo = cotaMax - (vertical - topo) * intervaloCota / (base - topo);
    return curva.reduce((maisProxima, ponto) =>
      Math.abs(ponto.cotaPontaM - cotaAlvo) < Math.abs(maisProxima - cotaAlvo)
        ? ponto.cotaPontaM : maisProxima, cotaMax);
  }

  return (
    <figure className="carga-card carga-curva">
      <figcaption className="carga-card-cabecalho">
        <h2>Curva por cota de ponta</h2>
        <div className="carga-legenda" aria-label="Legenda do gráfico">
          {METODOS_CARGA.map(({ classe, nome }) => (
            <span key={classe} className={`carga-metodo-${classe}`}><i />{nome}</span>
          ))}
          {cargaPrevista != null && <span className="carga-legenda-prevista"><i />Carga prevista</span>}
        </div>
      </figcaption>

      <div
        className="carga-grafico" ref={aresta} tabIndex={0} role="group"
        aria-label="Gráfico de carga admissível por cota de ponta"
        aria-describedby={ajudaId} onKeyDown={selecionarPeloTeclado}
      >
        <p className="workspace-sr-only" aria-live="polite">
          Cota {cotaEmMetros(cota)}.{" "}
          {METODOS_CARGA.map(({ chave, nome }) =>
            nome + " " + textoCarga(cargaFinal(selecionado[chave], unidade), unidade),
          ).join(". ")}.
        </p>
        <svg
          viewBox={`0 0 ${largura} ${ALTURA}`} aria-hidden="true"
          onPointerMove={(event) => {
            if (event.pointerType === "mouse") setCotaSobCursor(cotaDoPonteiro(event));
          }}
          onPointerLeave={() => setCotaSobCursor(null)}
          onClick={(event) => {
            const novaCota = cotaDoPonteiro(event);
            if (novaCota != null) onSelecionar(novaCota);
          }}
        >
          <rect x={esquerda} y={topo} width={Math.max(1, direita - esquerda)} height={base - topo} className="carga-plot-fundo" />
          {marcasY.map((v) => (
            <g key={v}>
              <line x1={esquerda} x2={direita} y1={y(v)} y2={y(v)} className="carga-plot-grade" />
              <text x={esquerda - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">{formatarMarca(v)}</text>
            </g>
          ))}
          {marcasX.map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={topo} y2={base} className="carga-plot-grade" />
              <text x={x(v)} y={base + 17} textAnchor="middle">{formatarMarca(v)}</text>
            </g>
          ))}
          <path d={`M ${esquerda} ${topo} V ${base} H ${direita}`} className="carga-plot-eixo" />
          <text x={(esquerda + direita) / 2} y={ALTURA - 9} textAnchor="middle" className="carga-plot-rotulo">
            Carga admissível ({unidade})
          </text>
          <text transform={`translate(13 ${(topo + base) / 2}) rotate(-90)`} textAnchor="middle" className="carga-plot-rotulo">
            Cota de ponta (m)
          </text>

          {cargaPrevista != null && (
            <line x1={x(cargaPrevista)} x2={x(cargaPrevista)} y1={topo} y2={base} className="carga-plot-prevista" />
          )}
          {cotaSobCursor != null && cotaSobCursor !== cota && (
            <line x1={esquerda} x2={direita} y1={y(cotaSobCursor)} y2={y(cotaSobCursor)} className="carga-plot-cursor" />
          )}
          <line x1={esquerda} x2={direita} y1={y(cota)} y2={y(cota)} className="carga-plot-selecao" />

          {METODOS_CARGA.map(({ chave, classe }) => {
            const caminho = curva.map((ponto, i) => {
              const continua = i > 0 && curva[i - 1].cotaPontaM - ponto.cotaPontaM === 1;
              return `${continua ? "L" : "M"} ${x(cargaFinal(ponto[chave], unidade))} ${y(ponto.cotaPontaM)}`;
            }).join(" ");
            return (
              <g key={chave} className={`carga-metodo-${classe}`}>
                <path d={caminho} className="carga-plot-metodo" />
                {curva.map((ponto) => (
                  <circle key={ponto.cotaPontaM} cx={x(cargaFinal(ponto[chave], unidade))} cy={y(ponto.cotaPontaM)} r="2.2" className="carga-plot-ponto" />
                ))}
                <circle cx={x(cargaFinal(selecionado[chave], unidade))} cy={y(cota)} r={classe === "dq" ? "4.5" : "7"} className="carga-plot-ponto-ativo" />
              </g>
            );
          })}
        </svg>
      </div>
      <p className="carga-curva-ajuda" id={ajudaId}>
        Clique no gráfico ou use as setas ↑ e ↓ para selecionar uma cota.
      </p>
    </figure>
  );
}
