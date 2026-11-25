import { useEffect, useId, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Braces, Download, FileText, LoaderCircle, Sheet } from "lucide-react";
import CriteriosCarga from "../../components/workspace/carga/CriteriosCarga";
import { carregarLocacao, useLocacaoData } from "../../hooks/useLocacaoData";
import { cargaAdmissivelService } from "../../services/cargaAdmissivelService";
import { OPCOES_CARGA_PADRAO } from "../../utils/cargaAdmissivel";
import { nomeArquivo, prepararRelatorio, selecionarDados } from "../../utils/relatorios/modelo";
import "./CargaAdmissivel.css";
import "./Relatorios.css";

const formatos = [
  { id: "planilha", nome: "Planilha XLSX", icone: Sheet, texto: "Cadastros, leituras SPT, curvas por método e parcelas de resistência em dez abas." },
  { id: "compacto", nome: "PDF compacto", icone: FileText, texto: "Identificação, critérios e quadro das cotas que atendem à carga prevista pelos dois métodos." },
  { id: "completo", nome: "PDF completo", icone: BookOpen, texto: "Perfis SPT, gráficos, resultados por cota e memorial de ponta e fuste de cada par." },
  { id: "intercambio", nome: "JSON de intercâmbio", icone: Braces, texto: "Dados de entrada, unidades, curvas e memoriais em um contrato versionado." },
];

async function gerarArquivo(r, id) {
  if (id === "intercambio") return new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  if (id === "planilha") return (await import("../../utils/relatorios/xlsx")).gerarXlsx(r);
  return (await import("../../utils/relatorios/pdf")).gerarPdf(r, id === "completo");
}

function Seletor({ nome, todos, opcoes, valor, mudar }) {
  const id = useId();
  return <div className="carga-campo"><label htmlFor={id}>{nome}</label>
    <select id={id} value={valor} onChange={(e) => mudar(e.target.value)}>
      <option value="">{todos}</option>
      {opcoes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
    </select>
  </div>;
}

function RelatoriosDaObra({ obraId }) {
  const { dados, carregando, atualizar } = useLocacaoData(obraId);
  const [filtro, setFiltro] = useState({ estaca: "", sondagem: "" });
  const [opcoes, setOpcoes] = useState(OPCOES_CARGA_PADRAO);
  const [relatorio, setRelatorio] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const operacao = useRef(null);
  useEffect(() => () => operacao.current?.abort(), []);

  function limpar() {
    setRelatorio(null); setMensagem(""); setErro("");
  }

  async function executar(tarefa) {
    if (operacao.current) return;
    const controller = new AbortController();
    operacao.current = controller;
    setOcupado(true); setErro("");
    try {
      await tarefa(controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) { setErro(e.message); setMensagem(""); }
    } finally {
      if (operacao.current === controller) {
        operacao.current = null;
        if (!controller.signal.aborted) setOcupado(false);
      }
    }
  }

  function atualizarCadastros() {
    limpar(); setFiltro({ estaca: "", sondagem: "" }); atualizar();
  }

  function cancelar() {
    operacao.current?.abort();
    operacao.current = null;
    setOcupado(false); setMensagem("Preparação cancelada.");
  }

  function preparar() {
    executar(async (signal) => {
      limpar(); setMensagem("Lendo os dados da obra…");
      const inicial = selecionarDados(dados, filtro);
      const r = await prepararRelatorio({
        dados: inicial, opcoes, calcular: cargaAdmissivelService.calcular, signal,
        progresso: (i, total, e, s) => setMensagem(`Calculando ${i + 1} de ${total} · ${e} / ${s}`),
      });
      // Os cadastros e as curvas vêm de requisições distintas. Detectar edições durante a preparação.
      const atualizado = await carregarLocacao(obraId);
      signal.throwIfAborted();
      if (!atualizado.completo) throw new Error(atualizado.erros.join(" "));
      if (["obra", "estacas", "sondagens"].some((campo) =>
        JSON.stringify(dados[campo]) !== JSON.stringify(atualizado[campo]))) {
        setFiltro({ estaca: "", sondagem: "" });
        atualizar();
        throw new Error("Os cadastros mudaram. Confira a seleção atualizada e prepare novamente.");
      }
      setRelatorio(r); setMensagem("Relatórios prontos para baixar.");
    });
  }

  function baixar(id) {
    executar(async (signal) => {
      setMensagem("Gerando arquivo…");
      const blob = await gerarArquivo(relatorio, id);
      signal.throwIfAborted();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nomeArquivo(relatorio, id);
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setMensagem("Arquivo gerado · " + a.download);
    });
  }

  const total = dados && (filtro.estaca ? 1 : dados.estacas.length) * (filtro.sondagem ? 1 : dados.sondagens.length);
  const falhas = relatorio?.analises.filter((a) => a.estado === "indisponivel") ?? [];
  return <div className="carga-page relatorios-page">
    <header className="carga-page-header"><h1>Relatórios</h1>
      <p>{dados?.obra?.nome && dados.obra.nome + " · "}Exportação da análise de carga admissível</p>
    </header>
    {carregando ? <p role="status">Carregando dados da obra…</p> : !dados?.completo ?
      <div className="carga-card carga-estado"><p role="alert">{dados?.erros.join(" ")}</p>
        <button className="carga-botao" onClick={atualizar}>Tentar novamente</button></div> :
      <>
        <section className="carga-card">
          <div className="relatorios-cab"><h2>Escopo do relatório</h2>
            <p>Cada estaca será avaliada separadamente para cada sondagem selecionada.</p></div>
          <fieldset disabled={ocupado} className="relatorios-filtros">
            <Seletor nome="Estacas" todos="Todas as estacas" opcoes={dados.estacas} valor={filtro.estaca}
              mudar={(estaca) => { limpar(); setFiltro({ ...filtro, estaca }); }} />
            <Seletor nome="Sondagens" todos="Todas as sondagens" opcoes={dados.sondagens} valor={filtro.sondagem}
              mudar={(sondagem) => { limpar(); setFiltro({ ...filtro, sondagem }); }} />
          </fieldset>
          <fieldset disabled={ocupado}><CriteriosCarga opcoes={opcoes} onOpcao={(k, v) => {
            limpar(); setOpcoes({ ...opcoes, [k]: v });
          }} /></fieldset>
          <div className="relatorios-acoes">
            <span>{total ? `${total} ${total === 1 ? "par estaca–sondagem" : "pares estaca–sondagem"}`
              : "Apenas dados cadastrais. O cálculo requer estaca e sondagem."}</span>
            <button className="carga-botao carga-botao-primario" disabled={ocupado} onClick={preparar}>
              {ocupado && <LoaderCircle size={16} className="workspace-spin" aria-hidden="true" />}
              {relatorio ? "Preparar novamente" : "Preparar relatórios"}
            </button>
            {ocupado && !relatorio && <button className="carga-botao" onClick={cancelar}>Cancelar</button>}
          </div>
        </section>
        <div aria-live="polite" className="relatorios-feedback">
          {mensagem && <p>{mensagem}</p>}
          {falhas.length > 0 && <p>{falhas.length} de {total} pares sem resultado. O motivo consta nos quatro arquivos.</p>}
        </div>
        {erro && <div className="carga-aviso carga-aviso-erro"><p role="alert">{erro}</p>
          <button className="carga-botao" onClick={atualizarCadastros}>Atualizar cadastros</button></div>}
        <section className="relatorios-grid" aria-label="Formatos de exportação">
          {formatos.map(({ id, nome, icone: Icone, texto }) => <article key={id} className="carga-card relatorio-formato">
            <div className={'relatorio-icone ' + id}><Icone size={22} aria-hidden="true" /></div>
            <h2>{nome}</h2><p>{texto}</p>
            <div><button className="carga-botao" disabled={!relatorio || ocupado} onClick={() => baixar(id)}>
              <Download size={16} aria-hidden="true" /> Baixar {nome}</button>
              {id === "intercambio" && <a href="/schemas/relatorio-v1.json" target="_blank" rel="noreferrer">JSON Schema v1</a>}
            </div>
          </article>)}
        </section>
      </>}
  </div>;
}

export default function Relatorios() {
  const { obraId } = useParams();
  return <RelatoriosDaObra key={obraId} obraId={obraId} />;
}
