import { useEffect, useRef, useState } from "react";
import { ArrowRight, Info, LoaderCircle, TriangleAlert } from "lucide-react";

import { cargaAdmissivelService } from "../../../services/cargaAdmissivelService";
import {
  cargaFinal, CRITERIOS_GOVERNANTES, cotaEmMetros, cotaMaisAltaQueAtende,
  METODOS_CARGA, textoCarga,
} from "../../../utils/cargaAdmissivel";
import CurvaCarga from "./CurvaCarga";
import MemorialCarga from "./MemorialCarga";

function QuadroPorCota({ curva, cota, unidade, onSelecionar }) {
  return (
    <div className="carga-tabela-rolagem" tabIndex={0} role="region" aria-label="Tabela por cota de ponta">
      <table className="carga-tabela">
        <thead>
          <tr>
            <th scope="col">Cota de ponta</th>
            <th scope="col">Compr. na grade</th>
            <th scope="col">NSPT da ponta</th>
            {METODOS_CARGA.map(({ chave, nome }) => <th scope="col" key={chave}>{nome}</th>)}
            <th scope="col">Menor carga admissível</th>
          </tr>
        </thead>
        <tbody>
          {curva.map((ponto) => {
            const cargas = METODOS_CARGA.map(({ chave }) => cargaFinal(ponto[chave], unidade));
            const ativa = ponto.cotaPontaM === cota;
            return (
              <tr key={ponto.cotaPontaM} data-selecionada={ativa || undefined}>
                <th scope="row">
                  <button type="button" className="carga-cota-tabela" aria-current={ativa || undefined} onClick={() => onSelecionar(ponto.cotaPontaM)}>
                    {cotaEmMetros(ponto.cotaPontaM)}
                  </button>
                </th>
                <td>{cotaEmMetros(ponto.comprimentoNaGradeM)}</td>
                <td>{ponto.nsptPonta}</td>
                {METODOS_CARGA.map(({ chave, classe }, i) => (
                  <td className={`carga-numero-metodo carga-metodo-${classe}`} key={chave}>
                    {textoCarga(cargas[i], unidade)}
                  </td>
                ))}
                <td><strong>{textoCarga(Math.min(...cargas), unidade)}</strong></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CotaAnalisada({ resultado, ponto, unidade, onSelecionar, onMemorial }) {
  return (
    <section className="carga-card carga-inspecao" aria-labelledby="carga-titulo-cota">
      <div className="carga-card-cabecalho">
        <h2 id="carga-titulo-cota">Cota analisada</h2>
        <span className="carga-contexto">{resultado.nomeEstaca} · {resultado.nomeSondagem}</span>
      </div>
      <div className="carga-campo">
        <label htmlFor="carga-cota">Cota de ponta</label>
        <select id="carga-cota" value={ponto.cotaPontaM} onChange={(event) => onSelecionar(Number(event.target.value))}>
          {resultado.curva.map(({ cotaPontaM }) => (
            <option key={cotaPontaM} value={cotaPontaM}>{cotaEmMetros(cotaPontaM)}</option>
          ))}
        </select>
      </div>
      <dl className="carga-dados-cota">
        <div><dt>Compr. na grade</dt><dd>{cotaEmMetros(ponto.comprimentoNaGradeM)}</dd></div>
        <div><dt>NSPT adotado na ponta</dt><dd>{ponto.nsptPonta}</dd></div>
      </dl>
      <div className="carga-metodos-resumo" role="group" aria-label="Cargas admissíveis finais">
        {METODOS_CARGA.map(({ chave, nome, classe }) => {
          const metodo = ponto[chave];
          const atende = metodo.cargaAdmissivelFinalTf >= resultado.cargaPrevistaTf;
          return (
            <div className={`carga-metodo-resumo carga-metodo-${classe}`} key={chave}>
              <h3>{nome}</h3>
              <strong>{textoCarga(cargaFinal(metodo, unidade), unidade)}</strong>
              <small>{CRITERIOS_GOVERNANTES[metodo.criterioGovernante]}</small>
              {resultado.cargaPrevistaTf > 0 && (
                <span className={atende ? "carga-atende" : "carga-abaixo"}>
                  {atende ? "Atinge a carga prevista" : "Abaixo da carga prevista"}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {(ponto.quantidadeLeiturasPonta < 3 || ponto.comprimentoFusteSemSptM > 0) && (
        <div className="carga-nota-cota">
          <Info size={16} aria-hidden="true" />
          <div>
            {ponto.quantidadeLeiturasPonta < 3 && (
              <p>Média de ponta com {ponto.quantidadeLeiturasPonta} de 3 cotas da grade.</p>
            )}
            {ponto.comprimentoFusteSemSptM > 0 && (
              <p>{cotaEmMetros(ponto.comprimentoFusteSemSptM)} de fuste sem contribuição por falta de SPT.</p>
            )}
          </div>
        </div>
      )}
      <button type="button" className="carga-botao carga-botao-memorial" onClick={onMemorial}>
        Ver memorial da cota <ArrowRight size={16} aria-hidden="true" />
      </button>
    </section>
  );
}

export default function ResultadosCarga({ respostaInicial, unidade }) {
  const [resultado, setResultado] = useState(respostaInicial);
  const [cota, setCota] = useState(() =>
    cotaMaisAltaQueAtende(respostaInicial.curva, respostaInicial.cargaPrevistaTf)
      ?? respostaInicial.curva.at(-1).cotaPontaM,
  );
  const [vista, setVista] = useState("comparacao");
  const [tentativa, setTentativa] = useState(0);
  const [consulta, setConsulta] = useState(null);
  const pedido = useRef(null);
  const detalhes = useRef(null);

  const { curva, cargaPrevistaTf } = resultado;
  const cotaQueAtende = cotaMaisAltaQueAtende(curva, cargaPrevistaTf);
  const cargaPrevista = cargaPrevistaTf > 0
    ? (unidade === "kN" ? cargaPrevistaTf * resultado.knPorTf : cargaPrevistaTf)
    : null;
  const limiteEstrutural = unidade === "kN" ? resultado.capacidadeEstruturalKn : resultado.capacidadeEstruturalTf;
  const ponto = curva.find((item) => item.cotaPontaM === cota);

  useEffect(() => {
    if (vista !== "memorial") return;
    const controller = new AbortController();
    pedido.current = controller;
    const { obraId, estacaId, sondagemId, opcoes } = respostaInicial;
    const timer = window.setTimeout(async () => {
      try {
        const dados = await cargaAdmissivelService.calcular(
          obraId, estacaId, { sondagemId, opcoes, cotaPontaM: cota }, controller.signal,
        );
        if (controller.signal.aborted) return;
        // O servidor recalcula com os cadastros atuais. A curva e o memorial vêm da mesma resposta.
        setResultado(dados);
        setConsulta({ cota, tentativa, erro: "" });
      } catch (error) {
        if (!controller.signal.aborted) setConsulta({ cota, tentativa, erro: error.message });
      }
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
      if (pedido.current === controller) pedido.current = null;
    };
  }, [respostaInicial, vista, cota, tentativa]);

  const memorialAtual = consulta?.cota === cota && consulta?.tentativa === tentativa ? consulta : null;

  function selecionar(novaCota) {
    if (novaCota === cota) return;
    pedido.current?.abort();
    setCota(novaCota);
    setTentativa((valor) => valor + 1);
  }

  function mostrarComparacao() {
    pedido.current?.abort();
    setVista("comparacao");
  }

  function mostrarMemorial() {
    if (vista === "memorial") return;
    setVista("memorial");
    setTentativa((valor) => valor + 1);
  }

  function irAoMemorial() {
    mostrarMemorial();
    detalhes.current?.focus({ preventScroll: true });
    detalhes.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="carga-resultados">
      <p className="workspace-sr-only" role="status">Curvas calculadas para {resultado.nomeEstaca} e {resultado.nomeSondagem}.</p>
      {resultado.avisos.includes("verificar_contato_ponta") && (
        <div className="carga-aviso carga-aviso-ponta">
          <TriangleAlert size={18} aria-hidden="true" />
          <p><strong>Verifique o contato de ponta.</strong> O cálculo considera a ponta conforme a hipótese executiva selecionada.</p>
        </div>
      )}
      <dl className="carga-card carga-painel-resumo">
        <div>
          <dt>Carga prevista</dt>
          <dd>{cargaPrevista == null ? "Não informada" : textoCarga(cargaPrevista, unidade)}</dd>
        </div>
        <div>
          <dt>Limite estrutural cadastrado</dt>
          <dd>{textoCarga(limiteEstrutural, unidade)}</dd>
        </div>
        <div>
          <dt>Maior cota que atende nos dois métodos</dt>
          <dd>{cotaQueAtende != null ? cotaEmMetros(cotaQueAtende) : cargaPrevista == null ? "Sem carga prevista" : "Nenhuma cota atende"}</dd>
        </div>
      </dl>

      <div className="carga-paineis-resultados">
        <CurvaCarga curva={curva} cota={cota} cargaPrevista={cargaPrevista} unidade={unidade} onSelecionar={selecionar} />
        <CotaAnalisada resultado={resultado} ponto={ponto} unidade={unidade} onSelecionar={selecionar} onMemorial={irAoMemorial} />
      </div>

      <section className="carga-card carga-detalhes" ref={detalhes} tabIndex={-1} aria-label="Detalhamento do cálculo">
        <div className="carga-detalhes-nav" role="group" aria-label="Visualização dos resultados">
          <button type="button" aria-pressed={vista === "comparacao"} onClick={mostrarComparacao}>Comparação por cota</button>
          <button type="button" aria-pressed={vista === "memorial"} onClick={mostrarMemorial}>Memorial de cálculo</button>
        </div>
        {vista === "comparacao" ? (
          <QuadroPorCota curva={curva} cota={cota} unidade={unidade} onSelecionar={selecionar} />
        ) : !memorialAtual ? (
          <div className="carga-estado" role="status">
            <LoaderCircle size={21} className="workspace-spin" aria-hidden="true" />
            Carregando memorial da cota {cotaEmMetros(cota)}…
          </div>
        ) : memorialAtual.erro ? (
          <div className="carga-estado">
            <p role="alert">{memorialAtual.erro}</p>
            <button type="button" className="carga-botao" onClick={() => setTentativa((valor) => valor + 1)}>
              Tentar carregar o memorial novamente
            </button>
          </div>
        ) : (
          <MemorialCarga resultado={resultado} ponto={ponto} unidade={unidade} />
        )}
      </section>
    </div>
  );
}
