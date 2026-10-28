import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  Expand,
  Focus,
  Hand,
  Layers3,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  desprojetarPonto,
  enquadrarCamera,
  limitesLocacao,
  marcasGrade,
  moverCamera,
  passoGrade,
  projetarPonto,
  temPosicao,
  zoomCamera,
} from "../../../utils/locacaoCamera";
import { posicionarRotulos } from "../../../utils/locacaoRotulos";

const fmt = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
export default function PlantaLocacao({
  pontos,
  todos,
  camadas,
  selecao,
  onSelecionar,
  onAbrirPainel,
  pedidoEnquadramento,
}) {
  const id = useId();
  const container = useRef(null),
    svg = useRef(null),
    inicial = useRef(pontos);
  const gestos = useRef({
    pointers: new Map(),
    inicio: null,
    pinch: null,
    moveu: false,
  });
  const ultimoPedido = useRef(null);
  const [viewport, setViewport] = useState({ largura: 900, altura: 640 });
  const [camera, setCamera] = useState(() => enquadrarCamera(pontos, 900, 640));
  const cameraRef = useRef(camera);
  const [hover, setHover] = useState(null),
    [arrastando, setArrastando] = useState(false);
  const [toque, setToque] = useState(false);
  const [cursor, setCursor] = useState(null);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  useLayoutEffect(() => {
    let primeiro = true;
    let alturaAnterior = 640;
    const observer = new ResizeObserver(([entry]) => {
      const largura = Math.max(240, entry.contentRect.width),
        altura = Math.max(300, entry.contentRect.height);
      setViewport({ largura, altura });
      if (primeiro) {
        setCamera(enquadrarCamera(inicial.current, largura, altura));
        primeiro = false;
      } else
        setCamera((c) => ({
          ...c,
          mPorPixel: (c.mPorPixel * alturaAnterior) / altura,
        }));
      alturaAnterior = altura;
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!pedidoEnquadramento || ultimoPedido.current === pedidoEnquadramento)
      return;
    ultimoPedido.current = pedidoEnquadramento;
    setCamera(
      enquadrarCamera(
        pedidoEnquadramento.pontos,
        viewport.largura,
        viewport.altura,
      ),
    );
  }, [pedidoEnquadramento, viewport]);
  useEffect(() => {
    const elemento = svg.current;
    function roda(e) {
      // A roda comum continua rolando a página. Ctrl/⌘ + roda e pinça do trackpad ampliam.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = elemento.getBoundingClientRect();
      setHover(null);
      setCamera((c) =>
        zoomCamera(
          c,
          Math.exp(-Math.max(-80, Math.min(80, e.deltaY)) * 0.012),
          { x: e.clientX - rect.left, y: e.clientY - rect.top },
          viewport,
        ),
      );
    }
    elemento.addEventListener("wheel", roda, { passive: false });
    return () => elemento.removeEventListener("wheel", roda);
  }, [viewport]);

  const projetar = (p) => projetarPonto(p, camera, viewport);
  const visiveis = pontos.filter(temPosicao);
  const posicoes = visiveis.map((p) => ({ ...p, pos: projetar(p) }));
  const naTela = posicoes.filter(
    (p) =>
      p.pos.x >= -20 &&
      p.pos.x <= viewport.largura + 20 &&
      p.pos.y >= -20 &&
      p.pos.y <= viewport.altura + 20,
  );
  const rotulos = camadas.nomes
    ? posicionarRotulos(naTela, {
        esquerda: 76,
        topo: 88,
        direita: viewport.largura - 64,
        fundo: viewport.altura - 65,
      })
    : [];
  const rotulosOcultos = rotulos.filter((p) => !p.rotulo).length;
  const min = desprojetarPonto({ x: 0, y: viewport.altura }, camera, viewport);
  const max = desprojetarPonto({ x: viewport.largura, y: 0 }, camera, viewport);
  const passo = passoGrade(camera.mPorPixel * 110);
  const xs = marcasGrade(min.x, max.x, passo),
    ys = marcasGrade(min.y, max.y, passo);
  const origemX =
    Math.abs(camera.x) >= 10000 ? Math.floor(camera.x / 1000) * 1000 : 0;
  const origemY =
    Math.abs(camera.y) >= 10000 ? Math.floor(camera.y / 1000) * 1000 : 0;
  const escala = passoGrade(camera.mPorPixel * 100),
    escalaPx = escala / camera.mPorPixel;
  const limites = limitesLocacao(visiveis);
  const h = hover && posicoes.find((p) => p.chave === hover);
  const coincidentes = new Map();
  for (const p of posicoes) {
    const chave = p.x + "/" + p.y;
    if (!coincidentes.has(chave)) coincidentes.set(chave, []);
    coincidentes.get(chave).push(p);
  }
  function local(e) {
    const rect = svg.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function selecionarPosicao(pos) {
    const candidatos = posicoes.filter(
      (p) =>
        Math.hypot(p.pos.x - pos.x, p.pos.y - pos.y) <=
        Math.max(14, (p.raio || 0) / camera.mPorPixel + 3),
    );
    if (!candidatos.length) {
      onSelecionar(null);
      return;
    }
    const indice = candidatos.findIndex((p) => p.chave === selecao);
    onSelecionar(candidatos[(indice + 1) % candidatos.length].chave);
  }
  function iniciar(e) {
    if (e.button !== 0 || (e.pointerType === "touch" && !toque)) return;
    svg.current.focus({ preventScroll: true });
    svg.current.setPointerCapture(e.pointerId);
    const g = gestos.current,
      pos = local(e);
    g.pointers.set(e.pointerId, pos);
    if (g.pointers.size === 1) {
      g.inicio = { pos, camera: cameraRef.current };
      g.moveu = false;
    }
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()];
      g.pinch = {
        distancia: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        centro: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        camera: cameraRef.current,
      };
      g.moveu = true;
    }
  }
  function mover(e) {
    const g = gestos.current,
      pos = local(e);
    setCursor(desprojetarPonto(pos, camera, viewport));
    if (!g.pointers.has(e.pointerId)) return;
    g.pointers.set(e.pointerId, pos);
    if (g.pointers.size >= 2 && g.pinch) {
      const [a, b] = [...g.pointers.values()],
        pinch = g.pinch;
      const centro = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const ampliada = zoomCamera(
        pinch.camera,
        Math.hypot(b.x - a.x, b.y - a.y) / pinch.distancia,
        pinch.centro,
        viewport,
      );
      setCamera(
        moverCamera(
          ampliada,
          centro.x - pinch.centro.x,
          centro.y - pinch.centro.y,
        ),
      );
      setArrastando(true);
      setHover(null);
    } else if (g.inicio) {
      const dx = pos.x - g.inicio.pos.x,
        dy = pos.y - g.inicio.pos.y;
      if (Math.hypot(dx, dy) > 5 || g.moveu) {
        g.moveu = true;
        setArrastando(true);
        setHover(null);
        setCamera(moverCamera(g.inicio.camera, dx, dy));
      }
    }
  }
  function terminar(e) {
    const g = gestos.current;
    if (!g.pointers.has(e.pointerId)) return;
    if (e.type !== "pointercancel" && !g.moveu) selecionarPosicao(local(e));
    g.pointers.delete(e.pointerId);
    g.pinch = null;
    if (g.pointers.size === 1)
      g.inicio = {
        pos: [...g.pointers.values()][0],
        camera: cameraRef.current,
      };
    else {
      g.inicio = null;
      g.moveu = false;
      setArrastando(false);
    }
    if (svg.current.hasPointerCapture(e.pointerId))
      svg.current.releasePointerCapture(e.pointerId);
  }
  function enquadrar(lista) {
    setCamera(enquadrarCamera(lista, viewport.largura, viewport.altura));
    setHover(null);
  }
  function zoom(fator) {
    setCamera((c) =>
      zoomCamera(
        c,
        fator,
        { x: viewport.largura / 2, y: viewport.altura / 2 },
        viewport,
      ),
    );
  }
  function teclado(e) {
    if (e.target !== e.currentTarget) return;
    const deslocamentos = {
      ArrowLeft: [55, 0],
      ArrowRight: [-55, 0],
      ArrowUp: [0, 55],
      ArrowDown: [0, -55],
    };
    if (deslocamentos[e.key]) {
      e.preventDefault();
      setCamera((c) => moverCamera(c, ...deslocamentos[e.key]));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoom(1.35);
    } else if (e.key === "-") {
      e.preventDefault();
      zoom(1 / 1.35);
    } else if (e.key === "Home" || e.key === "0") {
      e.preventDefault();
      enquadrar(todos);
    } else if (e.key === "Escape") {
      setToque(false);
      setHover(null);
      onSelecionar(null);
    }
  }
  return (
    <div
      className={
        "loc-map " +
        (arrastando ? "loc-dragging " : "") +
        (toque ? "loc-touch-active" : "")
      }
      ref={container}
    >
      <div className="loc-map-top">
        <button
          className="loc-button"
          aria-controls="loc-elementos"
          onClick={onAbrirPainel}
        >
          <Layers3 size={16} /> Camadas e lista
        </button>
        <span className="loc-map-stamp">
          PLANTA X/Y <i /> METROS
        </span>
      </div>
      <svg
        ref={svg}
        width="100%"
        height="100%"
        viewBox={"0 0 " + viewport.largura + " " + viewport.altura}
        role="group"
        tabIndex={0}
        aria-label="Planta interativa de locação"
        aria-describedby={id + "-ajuda"}
        onKeyDown={teclado}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
        onPointerLeave={() => {
          setHover(null);
          setCursor(null);
        }}
        data-camera={JSON.stringify(camera)}
      >
        <defs>
          <pattern
            id={id + "-dots"}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.65" fill="#cbd2df" />
          </pattern>
          <clipPath id={id + "-clip"}>
            <rect width={viewport.largura} height={viewport.altura} />
          </clipPath>
        </defs>
        <rect width="100%" height="100%" fill="#f8fafd" />
        <rect
          width="100%"
          height="100%"
          fill={"url(#" + id + "-dots)"}
          opacity="0.38"
        />
        <g clipPath={"url(#" + id + "-clip)"}>
          {camadas.grade && (
            <g className="loc-grid">
              {xs.map((x) => {
                const s = projetar({ x, y: camera.y }).x;
                return (
                  <g key={x}>
                    <line x1={s} x2={s} y1={0} y2={viewport.altura} />
                    <text x={s + 5} y={viewport.altura - 26}>
                      {fmt(x - origemX)}
                    </text>
                  </g>
                );
              })}
              {ys.map((y) => {
                const s = projetar({ x: camera.x, y }).y;
                return (
                  <g key={y}>
                    <line x1={0} x2={viewport.largura} y1={s} y2={s} />
                    <text x={12} y={s - 6}>
                      {fmt(y - origemY)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
          {camadas.cotas && limites && (
            <CotasPlanta
              limites={limites}
              projetar={projetar}
              viewport={viewport}
            />
          )}
          {naTela.map((p) => (
            <g
              key={p.chave}
              data-key={p.chave}
              className={
                "loc-marker loc-marker-" +
                p.tipo +
                (selecao === p.chave ? " loc-marker-selected" : "")
              }
              role="button"
              tabIndex={0}
              aria-label={p.nome + ", X " + p.x + " m, Y " + p.y + " m"}
              aria-pressed={selecao === p.chave}
              onFocus={() => setHover(p.chave)}
              onBlur={() => setHover(null)}
              onPointerEnter={() => {
                if (!gestos.current.moveu) setHover(p.chave);
              }}
              onPointerLeave={() => setHover(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelecionar(p.chave);
                }
              }}
            >
              <title>{p.nome + " · X " + p.x + " m · Y " + p.y + " m"}</title>
              <circle
                className="loc-hit"
                cx={p.pos.x}
                cy={p.pos.y}
                r={Math.max(
                  13,
                  Math.min(1000, (p.raio || 0) / camera.mPorPixel) + 4,
                )}
              />
              {p.tipo === "estaca" && p.raio != null ? (
                <circle
                  className="loc-physical"
                  cx={p.pos.x}
                  cy={p.pos.y}
                  r={p.raio / camera.mPorPixel}
                />
              ) : p.tipo === "estaca" ? (
                <path
                  className="loc-no-diameter"
                  d={
                    "M " +
                    (p.pos.x - 4) +
                    " " +
                    (p.pos.y - 4) +
                    " l 8 8 m 0 -8 l -8 8"
                  }
                />
              ) : (
                <path
                  className="loc-borehole"
                  d={"M " + p.pos.x + " " + (p.pos.y - 8) + " l 8 14 h -16 Z"}
                />
              )}
              <circle className="loc-center" cx={p.pos.x} cy={p.pos.y} r={2} />
            </g>
          ))}
          {camadas.nomes &&
            rotulos.map(
              (p) =>
                p.rotulo && (
                  <g
                    key={p.chave}
                    className={"loc-label loc-label-" + p.tipo}
                    pointerEvents="none"
                  >
                    <line
                      x1={p.pos.x}
                      y1={p.pos.y}
                      x2={p.rotulo.x}
                      y2={p.rotulo.y - 4}
                    />
                    <text x={p.rotulo.x} y={p.rotulo.y}>
                      {p.texto}
                    </text>
                  </g>
                ),
            )}
          {[...coincidentes.entries()]
            .filter(([, lista]) => lista.length > 1)
            .map(([chave, lista]) => {
              const p = lista[0];
              return (
                <g key={chave} pointerEvents="none" className="loc-stack">
                  <circle cx={p.pos.x + 12} cy={p.pos.y - 13} r={9} />
                  <text x={p.pos.x + 12} y={p.pos.y - 10} textAnchor="middle">
                    {lista.length}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
      <div className="loc-map-tools" aria-label="Controles da planta">
        <button
          className="loc-icon"
          aria-label="Ampliar planta"
          onClick={() => zoom(1.4)}
        >
          <Plus size={18} />
        </button>
        <button
          className="loc-icon"
          aria-label="Reduzir planta"
          onClick={() => zoom(1 / 1.4)}
        >
          <Minus size={18} />
        </button>
        <span />
        <button
          className="loc-icon"
          aria-label="Enquadrar visíveis"
          title="Enquadrar visíveis"
          disabled={!visiveis.length}
          onClick={() => enquadrar(visiveis)}
        >
          <Focus size={18} />
        </button>
        <button
          className="loc-icon"
          aria-label="Restaurar enquadramento geral"
          title="Restaurar enquadramento geral"
          onClick={() => enquadrar(todos)}
        >
          <RotateCcw size={17} />
        </button>
        <button
          className={"loc-icon loc-touch-toggle " + (toque ? "loc-active" : "")}
          aria-pressed={toque}
          aria-label="Ativar navegação por toque"
          onClick={() => setToque((v) => !v)}
        >
          <Hand size={18} />
        </button>
      </div>
      <div
        className="loc-coordinate-axis"
        aria-label="Direções dos eixos X e Y"
      >
        <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
          <path
            d="M 8 5 V 32 H 37 M 4 10 L 8 5 L 12 10 M 32 28 L 37 32 L 32 36"
            fill="none"
            stroke="currentColor"
          />
          <text x="15" y="12" fill="currentColor">
            Y
          </text>
          <text x="24" y="25" fill="currentColor">
            X
          </text>
        </svg>
      </div>
      <div className="loc-map-bottom">
        <div className="loc-scale">
          <span style={{ width: escalaPx }} />
          <strong>{fmt(escala)} m</strong>
        </div>
        <span>
          {cursor
            ? "X " + fmt(cursor.x) + " · Y " + fmt(cursor.y)
            : "Arraste para mover · Ctrl/⌘ + roda para ampliar"}
        </span>
      </div>
      {!visiveis.length && (
        <div className="loc-map-empty">
          <Expand size={28} />
          <h3>
            {todos.some(temPosicao)
              ? "Nenhum elemento visível"
              : "A planta começa com uma locação"}
          </h3>
          <p>
            {todos.some(temPosicao)
              ? "Restaure as camadas ou mostre um elemento pela lista."
              : "Os elementos com X e Y cadastrados aparecerão aqui."}
          </p>
          <button className="loc-button" onClick={onAbrirPainel}>
            Consultar elementos
          </button>
        </div>
      )}
      {h && !arrastando && (
        <div
          role="tooltip"
          className="loc-tooltip"
          style={{
            left: Math.max(8, Math.min(h.pos.x + 16, viewport.largura - 246)),
            top: Math.max(72, Math.min(h.pos.y + 20, viewport.altura - 125)),
          }}
        >
          <span>
            {h.tipo === "estaca" ? "Estaca" : "Sondagem"} · {h.referencia}
          </span>
          <strong>{h.nome}</strong>
          <p>
            X {fmt(h.x)} m · Y {fmt(h.y)} m
          </p>
          {(coincidentes.get(h.x + "/" + h.y)?.length || 0) > 1 && (
            <small>Clique novamente para alternar os coincidentes.</small>
          )}
        </div>
      )}
      <p className="workspace-sr-only" id={id + "-ajuda"}>
        Arraste para mover. Ctrl ou Command e roda para ampliar. Com a planta em
        foco, use setas para mover, mais e menos para zoom, Home para enquadrar
        e Escape para sair da navegação por toque. Tab acessa os pontos e os
        controles. A lista oferece seleção equivalente.
      </p>
      {(origemX !== 0 || origemY !== 0) && (
        <div className="loc-relative">
          Grade relativa: somar X {fmt(origemX)} m · Y {fmt(origemY)} m.
          Coordenadas reais no inspetor.
        </div>
      )}
      {rotulosOcultos > 0 && (
        <div className="loc-density">
          {rotulosOcultos} nome(s) em área densa · amplie ou use a lista
        </div>
      )}
    </div>
  );
}
function CotasPlanta({ limites: b, projetar, viewport }) {
  const a = projetar({ x: b.minX, y: b.minY }),
    c = projetar({ x: b.maxX, y: b.maxY });
  const y = Math.max(110, Math.min(viewport.altura - 80, a.y + 40)),
    x = Math.max(82, Math.min(viewport.largura - 80, a.x - 40));
  return (
    <g className="loc-plan-dims" pointerEvents="none">
      {b.maxX > b.minX && (
        <g>
          <line x1={a.x} x2={c.x} y1={y} y2={y} />
          <line x1={a.x} x2={a.x} y1={a.y + 6} y2={y + 5} />
          <line x1={c.x} x2={c.x} y1={a.y + 6} y2={y + 5} />
          <text x={(a.x + c.x) / 2} y={y - 7} textAnchor="middle">
            ΔX {fmt(b.maxX - b.minX)} m
          </text>
        </g>
      )}
      {b.maxY > b.minY && (
        <g>
          <line x1={x} x2={x} y1={a.y} y2={c.y} />
          <line x1={x - 5} x2={a.x - 6} y1={a.y} y2={a.y} />
          <line x1={x - 5} x2={a.x - 6} y1={c.y} y2={c.y} />
          <text
            transform={
              "translate(" + (x - 8) + "," + (a.y + c.y) / 2 + ") rotate(-90)"
            }
            textAnchor="middle"
          >
            ΔY {fmt(b.maxY - b.minY)} m
          </text>
        </g>
      )}
    </g>
  );
}
