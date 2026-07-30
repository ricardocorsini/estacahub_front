import { useId, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  FAMILIAS_SOLO,
  TIPOS_SOLO,
  obterConfigFamilia,
  obterConfigSolo,
} from "./soloConfig";

const SVG_WIDTH = 900;
const HEADER_HEIGHT = 72;
const FOOTER_HEIGHT = 34;
const MIN_BODY_HEIGHT = 420;
const PIXELS_POR_METRO = 46;

const COLUNAS = {
  profundidade: { x: 0, largura: 62 },
  cota: { x: 62, largura: 72 },
  solo: { x: 134, largura: 246 },
  grafico: { x: 380, largura: 520 },
};

const numeroValido = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
};

const formatarNumero = (valor, casas = 2) => {
  const numero = numeroValido(valor);
  return numero === null
    ? "—"
    : numero.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      });
};

const criarSequencia = (inicio, fim, passo) => {
  const valores = [];
  for (let valor = inicio; valor <= fim + passo / 100; valor += passo) {
    valores.push(Number(valor.toFixed(8)));
  }
  return valores;
};

const obterPassoNSPT = (maximo) => {
  if (maximo <= 50) return 10;
  if (maximo <= 100) return 20;
  return Math.ceil(maximo / 5 / 10) * 10;
};

const quebrarNomeSolo = (nome) => {
  if (!nome) return ["Não informado"];
  if (nome.length <= 19) return [nome];

  const palavras = nome.split(" ");
  const linhas = [""];

  palavras.forEach((palavra) => {
    const linhaAtual = linhas[linhas.length - 1];
    const proposta = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;

    if (proposta.length <= 18 || linhas.length === 2) {
      linhas[linhas.length - 1] = proposta;
    } else {
      linhas.push(palavra);
    }
  });

  return linhas.slice(0, 2);
};

function DefinicaoHachura({ id, config }) {
  const { cor, corLinha, hachura } = config;

  const conteudo = (() => {
    switch (hachura) {
      case "dots":
        return <circle cx="4" cy="4" r="1.25" fill={corLinha} />;
      case "dotsLarge":
        return <circle cx="6" cy="6" r="2" fill={corLinha} />;
      case "diagonal":
        return <path d="M-2 10 L10 -2 M4 14 L14 4" stroke={corLinha} strokeWidth="1.2" />;
      case "diagonalDense":
        return <path d="M-2 8 L8 -2 M2 12 L12 2 M6 16 L16 6" stroke={corLinha} strokeWidth="1" />;
      case "diagonalReverse":
        return <path d="M-2 -2 L10 10 M4 -4 L14 6 M-4 4 L6 14" stroke={corLinha} strokeWidth="1.2" />;
      case "cross":
        return (
          <>
            <path d="M-2 10 L10 -2 M4 14 L14 4" stroke={corLinha} strokeWidth="1" />
            <path d="M-2 -2 L10 10 M4 -4 L14 6" stroke={corLinha} strokeWidth="1" />
          </>
        );
      case "grid":
        return <path d="M0 0 H10 M0 5 H10 M0 10 H10 M0 0 V10 M5 0 V10 M10 0 V10" stroke={corLinha} strokeWidth="0.7" />;
      case "horizontal":
        return <path d="M0 3 H10 M0 8 H10" stroke={corLinha} strokeWidth="1" />;
      case "horizontalDense":
        return <path d="M0 2 H10 M0 5 H10 M0 8 H10" stroke={corLinha} strokeWidth="1" />;
      case "vertical":
        return <path d="M3 0 V10 M8 0 V10" stroke={corLinha} strokeWidth="1" />;
      case "verticalDense":
        return <path d="M2 0 V10 M5 0 V10 M8 0 V10" stroke={corLinha} strokeWidth="1" />;
      case "zigzag":
        return <path d="M-2 7 L2 3 L6 7 L10 3 L14 7" fill="none" stroke={corLinha} strokeWidth="1.1" />;
      case "brick":
        return <path d="M0 0 H12 M0 6 H12 M3 0 V6 M9 6 V12" fill="none" stroke={corLinha} strokeWidth="0.9" />;
      case "diamonds":
        return <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="none" stroke={corLinha} strokeWidth="1" />;
      case "dash":
        return <path d="M1 3 H5 M7 8 H11" stroke={corLinha} strokeWidth="1.6" strokeLinecap="round" />;
      default:
        return <path d="M-2 10 L10 -2 M4 14 L14 4" stroke={corLinha} strokeWidth="1" />;
    }
  })();

  const tamanho = hachura === "dotsLarge" || hachura === "brick" ? 12 : 10;

  return (
    <pattern id={id} width={tamanho} height={tamanho} patternUnits="userSpaceOnUse">
      <rect width={tamanho} height={tamanho} fill={cor} />
      {conteudo}
    </pattern>
  );
}

function AmostraSolo({ config }) {
  const idBase = useId().replace(/:/g, "");
  const patternId = `legenda-solo-${idBase}`;

  return (
    <svg viewBox="0 0 42 28" className="h-7 w-10 shrink-0 rounded border border-slate-300" aria-hidden="true">
      <defs>
        <DefinicaoHachura id={patternId} config={config} />
      </defs>
      <rect x="0" y="0" width="42" height="28" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default function PerfilSondagem({
  nomeSondagem = "Sondagem",
  leituras = [],
  cotaBoca,
  profundidadeFinal,
  nivelAgua,
  criterio,
  coordX,
  coordY,
  className = "",
}) {
  const idBase = useId().replace(/:/g, "");
  const relatorioRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState("");

  const baixarImagem = async () => {
    if (!relatorioRef.current || exportando) return;

    setExportando(true);
    setErroExportacao("");

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(relatorioRef.current, {
        backgroundColor: "#FFFFFF",
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.dataset.exportIgnore === "true"
          ),
      });

      const nomeArquivo = String(nomeSondagem || "sondagem")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      const link = document.createElement("a");
      link.download = `perfil-spt-${nomeArquivo || "sondagem"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (erro) {
      console.error("Erro ao exportar o perfil SPT:", erro);
      setErroExportacao("Não foi possível gerar a imagem.");
    } finally {
      setExportando(false);
    }
  };

  const dados = useMemo(() => {
    const cotaInicial = numeroValido(cotaBoca);

    const leiturasNormalizadas = leituras
      .map((leitura, indice) => {
        const profundidade = numeroValido(leitura.profundidade);
        if (profundidade === null || profundidade < 0) return null;

        const cotaInformada = numeroValido(leitura.cota);
        const nspt = numeroValido(leitura.nspt);

        return {
          ...leitura,
          indiceOriginal: indice,
          profundidade,
          cota:
            cotaInformada ??
            (cotaInicial !== null ? cotaInicial - profundidade : null),
          nspt,
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        a.profundidade === b.profundidade
          ? a.indiceOriginal - b.indiceOriginal
          : a.profundidade - b.profundidade
      );

    const maiorProfundidadeLeitura =
      leiturasNormalizadas.at(-1)?.profundidade ?? 0;
    const profundidadeInformada = numeroValido(profundidadeFinal) ?? 0;
    const profundidadeMaxima = Math.max(
      1,
      maiorProfundidadeLeitura,
      profundidadeInformada
    );

    const camadas = [];
    let inicioCamada = 0;

    leiturasNormalizadas.forEach((leitura) => {
      const fimCamada = Math.max(inicioCamada, leitura.profundidade);
      const camadaAnterior = camadas.at(-1);

      if (
        camadaAnterior &&
        camadaAnterior.solo === leitura.solo &&
        Math.abs(camadaAnterior.fim - inicioCamada) < 0.0001
      ) {
        camadaAnterior.fim = fimCamada;
        camadaAnterior.leituras.push(leitura);
      } else {
        camadas.push({
          solo: leitura.solo,
          familia: leitura.familia,
          inicio: inicioCamada,
          fim: fimCamada,
          leituras: [leitura],
        });
      }

      inicioCamada = fimCamada;
    });

    if (inicioCamada < profundidadeMaxima) {
      camadas.push({
        solo: "",
        familia: "",
        inicio: inicioCamada,
        fim: profundidadeMaxima,
        leituras: [],
        naoInformada: true,
      });
    }

    const maiorNSPT = Math.max(
      0,
      ...leiturasNormalizadas.map((leitura) => leitura.nspt ?? 0)
    );
    const passoNSPT = obterPassoNSPT(Math.max(50, maiorNSPT));
    const maximoNSPT = Math.max(
      50,
      Math.ceil(maiorNSPT / passoNSPT) * passoNSPT
    );

    const solosUsados = [
      ...new Set(
        leiturasNormalizadas
          .map((leitura) => leitura.solo)
          .filter(Boolean)
      ),
    ]
      .map(obterConfigSolo)
      .filter(Boolean);

    return {
      cotaInicial,
      leituras: leiturasNormalizadas,
      camadas,
      profundidadeMaxima,
      maiorNSPT,
      passoNSPT,
      maximoNSPT,
      solosUsados,
    };
  }, [cotaBoca, leituras, profundidadeFinal]);

  const corpoAltura = Math.max(
    MIN_BODY_HEIGHT,
    dados.profundidadeMaxima * PIXELS_POR_METRO
  );
  const svgHeight = HEADER_HEIGHT + corpoAltura + FOOTER_HEIGHT;

  const escalaY = (profundidade) =>
    HEADER_HEIGHT +
    (profundidade / dados.profundidadeMaxima) * corpoAltura;

  const margemGraficoX = 42;
  const graficoInicioX = COLUNAS.grafico.x + margemGraficoX;
  const graficoFimX =
    COLUNAS.grafico.x + COLUNAS.grafico.largura - margemGraficoX;

  const escalaX = (nspt) =>
    graficoInicioX +
    (Math.max(0, nspt) / dados.maximoNSPT) *
      (graficoFimX - graficoInicioX);

  const passoProfundidade = dados.profundidadeMaxima > 24 ? 2 : 1;
  const ticksProfundidade = criarSequencia(
    0,
    Math.floor(dados.profundidadeMaxima),
    passoProfundidade
  );
  const ticksNSPT = criarSequencia(
    0,
    dados.maximoNSPT,
    dados.passoNSPT
  );

  const pontosNSPT = dados.leituras.filter(
    (leitura) => leitura.nspt !== null
  );
  const pontosPolyline = pontosNSPT
    .map(
      (leitura) =>
        `${escalaX(leitura.nspt)},${escalaY(leitura.profundidade)}`
    )
    .join(" ");

  const nivelAguaNumero = numeroValido(nivelAgua);
  const exibirNivelAgua =
    nivelAguaNumero !== null &&
    nivelAguaNumero >= 0 &&
    nivelAguaNumero <= dados.profundidadeMaxima;

  const patterns = useMemo(
    () =>
      TIPOS_SOLO.map((config) => ({
        config,
        id: `solo-${idBase}-${config.nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .toLowerCase()}`,
      })),
    [idBase]
  );

  const patternPorSolo = useMemo(
    () =>
      Object.fromEntries(
        patterns.map(({ config, id }) => [config.nome, id])
      ),
    [patterns]
  );

  return (
    <section
      ref={relatorioRef}
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Relatório de sondagem
            </p>
            <h2 className="mt-1 text-base font-bold text-slate-900">
              {nomeSondagem} · Perfil geotécnico SPT
            </h2>
          </div>

          <div data-export-ignore="true" className="flex flex-col items-start gap-1 sm:items-end">
            <button
              type="button"
              onClick={baixarImagem}
              disabled={exportando || dados.leituras.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" />
              </svg>
              {exportando ? "Gerando PNG..." : "Baixar relatório PNG"}
            </button>
            {erroExportacao && (
              <span className="text-[10px] font-medium text-red-600">
                {erroExportacao}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
            Prof. final: {formatarNumero(dados.profundidadeMaxima)} m
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
            Cota da boca: {formatarNumero(dados.cotaInicial)} m
          </span>
          {numeroValido(nivelAgua) !== null && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
              Nível d'água: {formatarNumero(nivelAgua)} m
            </span>
          )}
          {criterio && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              Critério: {criterio}
            </span>
          )}
          {numeroValido(coordX) !== null && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              X: {formatarNumero(coordX, 0)}
            </span>
          )}
          {numeroValido(coordY) !== null && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              Y: {formatarNumero(coordY, 0)}
            </span>
          )}
        </div>
      </div>

      {dados.leituras.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5m0 14h16M8 15l3-3 3 2 4-6"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            Adicione leituras para gerar o perfil
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
            O gráfico será atualizado automaticamente conforme profundidade,
            cota, NSPT e tipo de solo forem preenchidos.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`Perfil geotécnico da sondagem ${nomeSondagem}`}
            >
              <defs>
                {patterns.map(({ config, id }) => (
                  <DefinicaoHachura key={id} id={id} config={config} />
                ))}
                <clipPath id={`clip-solo-${idBase}`}>
                  <rect
                    x={COLUNAS.solo.x}
                    y={HEADER_HEIGHT}
                    width={COLUNAS.solo.largura}
                    height={corpoAltura}
                  />
                </clipPath>
              </defs>

              <rect width={SVG_WIDTH} height={svgHeight} fill="#FFFFFF" />
              <rect
                x="0"
                y="0"
                width={SVG_WIDTH}
                height={HEADER_HEIGHT}
                fill="#F8FAFC"
              />

              {[COLUNAS.cota.x, COLUNAS.solo.x, COLUNAS.grafico.x, SVG_WIDTH].map(
                (x) => (
                  <line
                    key={`divisor-${x}`}
                    x1={x}
                    x2={x}
                    y1="0"
                    y2={HEADER_HEIGHT + corpoAltura}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                )
              )}

              <line
                x1="0"
                x2={SVG_WIDTH}
                y1={HEADER_HEIGHT}
                y2={HEADER_HEIGHT}
                stroke="#94A3B8"
                strokeWidth="1.2"
              />

              <text
                x={COLUNAS.profundidade.x + COLUNAS.profundidade.largura / 2}
                y="29"
                textAnchor="middle"
                className="fill-slate-700 text-[12px] font-bold"
              >
                PROF.
              </text>
              <text
                x={COLUNAS.profundidade.x + COLUNAS.profundidade.largura / 2}
                y="47"
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                leitura (m)
              </text>

              <text
                x={COLUNAS.cota.x + COLUNAS.cota.largura / 2}
                y="29"
                textAnchor="middle"
                className="fill-slate-700 text-[12px] font-bold"
              >
                COTA
              </text>
              <text
                x={COLUNAS.cota.x + COLUNAS.cota.largura / 2}
                y="47"
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                terreno (m)
              </text>

              <text
                x={COLUNAS.solo.x + COLUNAS.solo.largura / 2}
                y="29"
                textAnchor="middle"
                className="fill-slate-700 text-[12px] font-bold"
              >
                PERFIL LITOLÓGICO
              </text>
              <text
                x={COLUNAS.solo.x + COLUNAS.solo.largura / 2}
                y="47"
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                solo, intervalo e família
              </text>

              <text
                x={COLUNAS.grafico.x + COLUNAS.grafico.largura / 2}
                y="21"
                textAnchor="middle"
                className="fill-slate-700 text-[12px] font-bold"
              >
                RESISTÊNCIA À PENETRAÇÃO · N-SPT
              </text>

              {ticksNSPT.map((tick) => {
                const x = escalaX(tick);
                return (
                  <g key={`tick-nspt-${tick}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1="39"
                      y2={HEADER_HEIGHT + corpoAltura}
                      stroke={tick === 0 ? "#64748B" : "#E2E8F0"}
                      strokeWidth={tick === 0 ? "1.3" : "1"}
                    />
                    <text
                      x={x}
                      y="57"
                      textAnchor="middle"
                      className="fill-slate-600 text-[10px] font-semibold"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {ticksProfundidade.map((profundidade) => {
                const y = escalaY(profundidade);
                const cota =
                  dados.cotaInicial !== null
                    ? dados.cotaInicial - profundidade
                    : null;

                return (
                  <g key={`linha-profundidade-${profundidade}`}>
                    <line
                      x1="0"
                      x2={SVG_WIDTH}
                      y1={y}
                      y2={y}
                      stroke={profundidade === 0 ? "#94A3B8" : "#E2E8F0"}
                      strokeWidth={profundidade === 0 ? "1.2" : "1"}
                    />
                    <text
                      x={COLUNAS.profundidade.x + COLUNAS.profundidade.largura / 2}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px]"
                    >
                      {formatarNumero(profundidade, 1)}
                    </text>
                    <text
                      x={COLUNAS.cota.x + COLUNAS.cota.largura / 2}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-slate-400 text-[9px]"
                    >
                      {formatarNumero(cota, 2)}
                    </text>
                  </g>
                );
              })}

              <g clipPath={`url(#clip-solo-${idBase})`}>
                {dados.camadas.map((camada, indice) => {
                  const yInicio = escalaY(camada.inicio);
                  const yFim = escalaY(camada.fim);
                  const altura = Math.max(1, yFim - yInicio);
                  const config = obterConfigSolo(camada.solo);
                  const centroY = yInicio + altura / 2;
                  const linhasNome = quebrarNomeSolo(camada.solo);
                  const familia = obterConfigFamilia(camada.familia);
                  const exibirDescricaoCompleta = altura >= 72;
                  const exibirFamilia = altura >= 46 && camada.familia;

                  return (
                    <g key={`${camada.solo || "sem-solo"}-${indice}`}>
                      <title>
                        {camada.solo || "Solo não informado"} · {formatarNumero(camada.inicio)} a {formatarNumero(camada.fim)} m · {familia.nome}
                      </title>
                      <rect
                        x={COLUNAS.solo.x}
                        y={yInicio}
                        width={COLUNAS.solo.largura}
                        height={altura}
                        fill={
                          config
                            ? `url(#${patternPorSolo[config.nome]})`
                            : "#F8FAFC"
                        }
                        stroke={config?.corLinha ?? "#CBD5E1"}
                        strokeWidth="1"
                        strokeDasharray={camada.naoInformada ? "5 4" : undefined}
                      />

                      {linhasNome.map((linha, linhaIndice) => (
                        <text
                          key={`${linha}-${linhaIndice}`}
                          x={COLUNAS.solo.x + 14}
                          y={
                            centroY -
                            (linhasNome.length - 1) * 7 +
                            linhaIndice * 14 -
                            (exibirDescricaoCompleta ? 8 : 0)
                          }
                          className="fill-slate-900 text-[11px] font-bold"
                        >
                          {linha}
                        </text>
                      ))}

                      {exibirDescricaoCompleta && (
                        <text
                          x={COLUNAS.solo.x + 14}
                          y={centroY + linhasNome.length * 7 + 7}
                          className="fill-slate-700 text-[9px] font-medium"
                        >
                          {formatarNumero(camada.inicio)} – {formatarNumero(camada.fim)} m
                        </text>
                      )}

                      {exibirFamilia && (
                        <g>
                          <rect
                            x={COLUNAS.solo.x + COLUNAS.solo.largura - 108}
                            y={centroY - 11}
                            width="94"
                            height="22"
                            rx="11"
                            fill="#FFFFFF"
                            fillOpacity="0.88"
                            stroke={config?.corLinha ?? "#94A3B8"}
                            strokeOpacity="0.5"
                          />
                          <text
                            x={COLUNAS.solo.x + COLUNAS.solo.largura - 61}
                            y={centroY + 3.5}
                            textAnchor="middle"
                            className="fill-slate-700 text-[9px] font-bold"
                          >
                            {familia.nome}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {dados.leituras.map((leitura) => {
                const y = escalaY(leitura.profundidade);

                return (
                  <g key={`leitura-${leitura.id ?? leitura.indiceOriginal}`}>
                    <line
                      x1="0"
                      x2={SVG_WIDTH}
                      y1={y}
                      y2={y}
                      stroke="#94A3B8"
                      strokeWidth="0.9"
                      strokeDasharray="2 3"
                    />
                    <rect
                      x={COLUNAS.profundidade.x + 10}
                      y={y - 11}
                      width={COLUNAS.profundidade.largura - 20}
                      height="22"
                      rx="5"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                    />
                    <text
                      x={COLUNAS.profundidade.x + COLUNAS.profundidade.largura / 2}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-slate-800 text-[10px] font-bold"
                    >
                      {formatarNumero(leitura.profundidade, 2)}
                    </text>
                    <rect
                      x={COLUNAS.cota.x + 10}
                      y={y - 11}
                      width={COLUNAS.cota.largura - 20}
                      height="22"
                      rx="5"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                    />
                    <text
                      x={COLUNAS.cota.x + COLUNAS.cota.largura / 2}
                      y={y + 4}
                      textAnchor="middle"
                      className="fill-slate-800 text-[10px] font-semibold"
                    >
                      {formatarNumero(leitura.cota, 2)}
                    </text>
                  </g>
                );
              })}

              {pontosPolyline && (
                <polyline
                  points={pontosPolyline}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {pontosNSPT.map((leitura) => {
                const x = escalaX(leitura.nspt);
                const y = escalaY(leitura.profundidade);
                const textoParaEsquerda = x > graficoFimX - 34;

                return (
                  <g key={`ponto-${leitura.id ?? leitura.indiceOriginal}`}>
                    <title>
                      Profundidade {formatarNumero(leitura.profundidade)} m · N-SPT {leitura.nspt}
                    </title>
                    <circle
                      cx={x}
                      cy={y}
                      r="5.5"
                      fill="#FFFFFF"
                      stroke="#4F46E5"
                      strokeWidth="3"
                    />
                    <rect
                      x={textoParaEsquerda ? x - 35 : x + 8}
                      y={y - 10}
                      width="27"
                      height="19"
                      rx="5"
                      fill="#EEF2FF"
                      stroke="#C7D2FE"
                    />
                    <text
                      x={textoParaEsquerda ? x - 21.5 : x + 21.5}
                      y={y + 3.5}
                      textAnchor="middle"
                      className="fill-indigo-700 text-[9px] font-bold"
                    >
                      {leitura.nspt}
                    </text>
                  </g>
                );
              })}

              {exibirNivelAgua && (
                <g>
                  <line
                    x1={COLUNAS.solo.x}
                    x2={SVG_WIDTH}
                    y1={escalaY(nivelAguaNumero)}
                    y2={escalaY(nivelAguaNumero)}
                    stroke="#0284C7"
                    strokeWidth="2"
                    strokeDasharray="8 5"
                  />
                  <rect
                    x={SVG_WIDTH - 108}
                    y={escalaY(nivelAguaNumero) - 13}
                    width="94"
                    height="25"
                    rx="12.5"
                    fill="#E0F2FE"
                    stroke="#38BDF8"
                  />
                  <text
                    x={SVG_WIDTH - 61}
                    y={escalaY(nivelAguaNumero) + 4}
                    textAnchor="middle"
                    className="fill-sky-700 text-[10px] font-bold"
                  >
                    NA {formatarNumero(nivelAguaNumero)} m
                  </text>
                </g>
              )}

              <text
                x={COLUNAS.profundidade.x + COLUNAS.profundidade.largura / 2}
                y={HEADER_HEIGHT + corpoAltura + 25}
                textAnchor="middle"
                className="fill-slate-400 text-[9px]"
              >
                Profundidade
              </text>
              <text
                x={COLUNAS.grafico.x + COLUNAS.grafico.largura / 2}
                y={HEADER_HEIGHT + corpoAltura + 25}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-semibold"
              >
                Número de golpes N-SPT
              </text>
            </svg>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-4">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                  Legenda de solos utilizados
                </h3>
                {dados.solosUsados.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {dados.solosUsados.map((config) => {
                      const familia = obterConfigFamilia(config.familia);
                      return (
                        <div
                          key={config.nome}
                          className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
                        >
                          <AmostraSolo config={config} />
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-800">
                              {config.nome}
                            </p>
                            <p className="truncate text-[10px] text-slate-500">
                              {familia.nome} · {familia.descricao}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Nenhum tipo de solo informado.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                {Object.entries(FAMILIAS_SOLO).map(([chave, familia]) => (
                  <span
                    key={chave}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${familia.classeBadge}`}
                    title={familia.descricao}
                  >
                    {familia.nome}: {familia.descricao}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2.5 text-[9px] text-slate-400">
            <span>Relatório gráfico de sondagem à percussão · N-SPT</span>
            <span>{nomeSondagem}</span>
          </div>
        </>
      )}
    </section>
  );
}
