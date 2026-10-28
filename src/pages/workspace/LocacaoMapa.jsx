import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Download,
  Layers3,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import PlantaLocacao from "../../components/workspace/locacao/PlantaLocacao";
import PainelElementos from "../../components/workspace/locacao/PainelElementos";
import ElementoDetalhes from "../../components/workspace/locacao/ElementoDetalhes";
import { useLocacaoData } from "../../hooks/useLocacaoData";
import { normalizarLocacao, pontosLocacao } from "../../utils/locacao";
import { valorCadastro } from "../../utils/valorCadastro";
import { temPosicao } from "../../utils/locacaoCamera";
import "./LocacaoMapa.css";

const CAMADAS = {
  estaca: true,
  sondagem: true,
  nomes: true,
  grade: true,
  cotas: false,
};
export default function LocacaoMapa() {
  const { obraId } = useParams();
  // A troca de obra descarta câmera, seleção, exportação e requisições da instância anterior.
  return <MapaDaObra key={obraId} obraId={obraId} />;
}
function MapaDaObra({ obraId }) {
  const { dados, carregando, atualizar } = useLocacaoData(obraId);
  const [camadas, setCamadas] = useState(CAMADAS);
  const [ocultos, setOcultos] = useState(() => new Set());
  const [selecao, setSelecao] = useState(null);
  const [painel, setPainel] = useState(
    () => window.matchMedia("(min-width: 1280px)").matches,
  );
  const [busca, setBusca] = useState(""),
    [filtro, setFiltro] = useState("todos");
  const [pedido, setPedido] = useState(null);
  const [exportando, setExportando] = useState(false),
    [exportacao, setExportacao] = useState(""),
    [erroExportacao, setErroExportacao] = useState("");
  const worker = useRef(null),
    travaExportacao = useRef(false);
  useEffect(() => () => worker.current?.terminate(), []);
  const pontos = useMemo(
    () => pontosLocacao(dados?.estacas || [], dados?.sondagens || []),
    [dados],
  );
  const visivel = (p) =>
    temPosicao(p) && camadas[p.tipo] && !ocultos.has(p.chave);
  const visiveis = pontos.filter(visivel),
    semLocacao = pontos.filter((p) => !temPosicao(p));
  const selecionado = pontos.find((p) => p.chave === selecao);
  const completo = dados?.completo && !carregando;
  const habilitarExportacao = completo && pontos.length > 0 && !exportando;
  function alternar(chave) {
    setOcultos((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }
  function restaurar() {
    setCamadas(CAMADAS);
    setOcultos(new Set());
    setBusca("");
    setFiltro("todos");
  }
  function selecionar(chave) {
    setSelecao(chave);
    if (chave && window.matchMedia("(max-width: 767px)").matches)
      setPainel(false);
  }
  function recarregar() {
    setExportacao("");
    setErroExportacao("");
    atualizar();
  }
  function exportar() {
    if (!habilitarExportacao || travaExportacao.current) return;
    travaExportacao.current = true;
    setExportando(true);
    setExportacao("");
    setErroExportacao("");
    const finalizar = () => {
      worker.current?.terminate();
      worker.current = null;
      travaExportacao.current = false;
      setExportando(false);
    };
    try {
      const modelo = normalizarLocacao(
        dados.obra,
        dados.estacas,
        dados.sondagens,
      );
      const tarefa = new Worker(
        new URL("../../workers/locacaoDxf.worker.js", import.meta.url),
        { type: "module" },
      );
      worker.current = tarefa;
      tarefa.onmessage = ({ data }) => {
        try {
          if (data.erro) throw new Error(data.erro);
          const url = URL.createObjectURL(
            new Blob([data.conteudo], {
              type: "application/dxf;charset=utf-8",
            }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = data.nomeArquivo;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 30000);
          setExportacao(
            "DXF gerado: " +
              pontos.length +
              " registros, " +
              modelo.localizados.length +
              " localizados e todos os quadros cadastrais.",
          );
        } catch (erro) {
          setErroExportacao(erro.message);
        } finally {
          finalizar();
        }
      };
      tarefa.onerror = () => {
        setErroExportacao(
          "Não foi possível gerar o DXF. Tente novamente ou atualize os dados.",
        );
        finalizar();
      };
      tarefa.postMessage({
        modelo,
        carregadoEm: dados.carregadoEm,
        geradoEm: new Date().toISOString(),
      });
    } catch (erro) {
      setErroExportacao(erro.message);
      finalizar();
    }
  }
  const referencial =
    dados?.obra?.sistemaCoordenadas === "utm"
      ? "UTM informado · fuso/datum não cadastrados"
      : dados?.obra?.sistemaCoordenadas === "local"
        ? "Referencial local informado"
        : "Referencial não informado";
  return (
    <div className="loc-page">
      <header className="loc-page-header">
        <div className="loc-heading">
          <span className="loc-eyebrow">PROJETO / LOCAÇÃO EM PLANTA</span>
          <h1>Locação / mapa</h1>
          <p>
            <strong>
              {dados?.obra?.nome ||
                (carregando ? "Carregando obra…" : "Obra indisponível")}
            </strong>
            {dados?.obra?.numero && (
              <span className="loc-project-number">Nº {dados.obra.numero}</span>
            )}
          </p>
          <div className="loc-reference">
            <span>{referencial}</span>
            <i /> X/Y e cotas em m · diâmetro em cm · cargas em tf
          </div>
        </div>
        <div className="loc-header-actions">
          <button
            className="loc-button"
            onClick={recarregar}
            disabled={carregando || exportando}
          >
            <RefreshCw
              size={16}
              className={carregando ? "workspace-spin" : ""}
            />{" "}
            Atualizar
          </button>
          <button
            className="loc-button loc-primary"
            onClick={exportar}
            disabled={!habilitarExportacao}
          >
            {exportando ? (
              <LoaderCircle size={17} className="workspace-spin" />
            ) : (
              <Download size={17} />
            )}{" "}
            {exportando ? "Gerando desenho…" : "Exportar DXF completo"}
          </button>
        </div>
      </header>
      <div className="loc-summary" aria-label="Resumo cadastral">
        <span>
          <i className="loc-symbol loc-symbol-estaca" />
          <strong>{dados?.estacas.length ?? "—"}</strong> estacas
        </span>
        <span>
          <i className="loc-symbol loc-symbol-sondagem" />
          <strong>{dados?.sondagens.length ?? "—"}</strong> sondagens
        </span>
        <button
          disabled={!semLocacao.length}
          className={semLocacao.length ? "loc-pending" : ""}
          onClick={() => {
            setFiltro("sem");
            setPainel(true);
          }}
        >
          <AlertCircle size={14} />
          <strong>{semLocacao.length}</strong> sem locação
        </button>
        <small>
          {carregando
            ? "Consultando API…"
            : dados?.completo
              ? "Base carregada às " +
                new Date(dados.carregadoEm).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) +
                " · atualize após alterações cadastrais"
              : "Consulta incompleta"}
        </small>
      </div>
      {dados?.erros.length > 0 && (
        <div className="loc-notice loc-error" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>
              DXF completo indisponível: a consulta está incompleta.
            </strong>
            {dados.erros.map((erro) => (
              <p key={erro}>{erro}</p>
            ))}
            <button onClick={recarregar} disabled={carregando}>
              Recarregar obra, estacas e sondagens
            </button>
          </div>
        </div>
      )}
      {completo && !pontos.length && (
        <div className="loc-notice" role="status">
          Esta obra ainda não possui estacas ou sondagens. Cadastre elementos
          para gerar o desenho técnico.
        </div>
      )}
      {completo && pontos.length > 0 && semLocacao.length === pontos.length && (
        <div className="loc-notice loc-warning" role="status">
          Todos os registros estão sem locação. O DXF conterá os quadros
          cadastrais e as pendências, sem geometria de locação.
        </div>
      )}
      {(exportacao || erroExportacao) && (
        <div
          className={
            "loc-notice " + (erroExportacao ? "loc-error" : "loc-success")
          }
          role={erroExportacao ? "alert" : "status"}
        >
          {erroExportacao ? <AlertCircle size={17} /> : <Check size={17} />}{" "}
          {erroExportacao || exportacao}
        </div>
      )}
      <section
        className={"loc-stage " + (painel ? "loc-panel-open" : "")}
        aria-label="Planta de locação da obra"
        aria-busy={carregando}
      >
        {painel && (
          <PainelElementos
            pontos={pontos}
            camadas={camadas}
            setCamadas={setCamadas}
            ocultos={ocultos}
            onAlternar={alternar}
            selecao={selecao}
            onSelecionar={selecionar}
            busca={busca}
            setBusca={setBusca}
            filtro={filtro}
            setFiltro={setFiltro}
            onRestaurar={restaurar}
            onFechar={() => setPainel(false)}
            visivel={visivel}
          />
        )}
        {dados ? (
          <PlantaLocacao
            pontos={visiveis}
            todos={pontos}
            camadas={camadas}
            selecao={selecao}
            onSelecionar={selecionar}
            onAbrirPainel={() => setPainel((v) => !v)}
            pedidoEnquadramento={pedido}
          />
        ) : (
          <div className="loc-loading" role="status">
            <LoaderCircle className="workspace-spin" size={28} />
            <h2>Preparando a planta</h2>
            <p>Consultando a obra, as estacas e as sondagens.</p>
          </div>
        )}
        {selecionado && (
          <ElementoDetalhes
            ponto={selecionado}
            obraId={obraId}
            visivel={visivel(selecionado)}
            coincidentes={pontos.filter(
              (p) =>
                temPosicao(p) && p.x === selecionado.x && p.y === selecionado.y,
            )}
            onSelecionar={selecionar}
            onFechar={() => setSelecao(null)}
            onEnquadrar={() => setPedido({ pontos: [selecionado] })}
            onVisibilidade={() => {
              if (!visivel(selecionado)) {
                setCamadas((c) => ({ ...c, [selecionado.tipo]: true }));
                setOcultos((o) => {
                  const novo = new Set(o);
                  novo.delete(selecionado.chave);
                  return novo;
                });
              } else alternar(selecionado.chave);
            }}
          />
        )}
        {carregando && dados && (
          <div className="loc-updating" role="status">
            <LoaderCircle size={15} className="workspace-spin" /> Atualizando a
            base…
          </div>
        )}
      </section>
      <div className="loc-legend">
        <span>
          <i className="loc-symbol loc-symbol-estaca" /> Estaca · circunferência
          externa em escala
        </span>
        <span>
          <i className="loc-symbol loc-symbol-sondagem" /> Sondagem · símbolo
          sem escala
        </span>
        <span>Halo = seleção / clique · centros preservados</span>
        <span>Grade = referência de locação</span>
      </div>
      <details className="loc-schedule">
        <summary>
          <Layers3 size={16} /> Quadro de coordenadas e convenções{" "}
          <span>{pontos.length} elementos</span>
        </summary>
        <div className="loc-schedule-body">
          <p>
            Modelo planimétrico X/Y com a mesma escala nos dois eixos. O DXF usa
            metros, escala geométrica 1:1 e inclui toda a base carregada, mesmo
            com elementos ocultos. Referências E/S identificam linhas dos
            quadros; não são eixos estruturais. Não há norte geográfico, limites
            de terreno ou vínculo estaca–sondagem cadastrado.
          </p>
          <p>
            Dimensões ΔX/ΔY medem a extensão dos centros projetados; os quadros
            fornecem as coordenadas absolutas. Cotas altimétricas permanecem
            como atributos. “Não informado” indica ausência de dado. Capacidade
            estrutural é o valor cadastrado.
          </p>
          <div
            className="loc-coordinates-table"
            tabIndex={0}
            role="region"
            aria-label="Quadro de coordenadas"
          >
            <table>
              <thead>
                <tr>
                  {[
                    "Ref.",
                    "Elemento",
                    "Tipo",
                    "X (m)",
                    "Y (m)",
                    "Situação",
                  ].map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pontos.map((p) => (
                  <tr key={p.chave}>
                    <td>{p.referencia}</td>
                    <th scope="row">
                      <button onClick={() => selecionar(p.chave)}>
                        {p.nome}
                      </button>
                    </th>
                    <td>{p.tipo === "estaca" ? "Estaca" : "Sondagem"}</td>
                    <td>{valorCadastro(p.x)}</td>
                    <td>{valorCadastro(p.y)}</td>
                    <td>{temPosicao(p) ? "Localizado" : "Sem locação"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}
