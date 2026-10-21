import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  CircleDollarSign,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Trash2,
} from "lucide-react";

import EstacaForm from "../../components/workspace/estacas/EstacaForm";
import MiniMapaLocacao from "../../components/workspace/estacas/MiniMapaLocacao";
import { estacasService } from "../../services/estacasService";
import { sondagensService } from "../../services/sondagensService";
import {
  alertasEstaca,
  formatarNumero,
  geometriaEstaca,
  nomeTipoEstaca,
  numero,
} from "../../utils/estacas";
import "./CadastroEstacas.css";

export default function CadastroEstacas() {
  const { obraId } = useParams();
  return <EstacasDaObra key={obraId} obraId={obraId} />;
}

function EstacasDaObra({ obraId }) {
  const [estacas, setEstacas] = useState([]);
  const [sondagens, setSondagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroSondagens, setErroSondagens] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [revisao, setRevisao] = useState(0);
  const [editor, setEditor] = useState(null);
  const [selecao, setSelecao] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [listaDisponivel, setListaDisponivel] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.allSettled([
      estacasService.listar(obraId),
      sondagensService.listar(obraId),
    ]).then(([resEstacas, resSondagens]) => {
      if (!ativo) return;
      if (
        resEstacas.status === "fulfilled" &&
        Array.isArray(resEstacas.value)
      ) {
        setEstacas(resEstacas.value);
        setListaDisponivel(true);
        setErro("");
      } else {
        setListaDisponivel(false);
        setErro(
          resEstacas.reason?.message || "Não foi possível carregar as estacas.",
        );
      }
      if (
        resSondagens.status === "fulfilled" &&
        Array.isArray(resSondagens.value)
      ) {
        setSondagens(resSondagens.value);
        setErroSondagens("");
      } else {
        setErroSondagens(
          resSondagens.reason?.message ||
            "Não foi possível carregar os furos de sondagem.",
        );
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [obraId, revisao]);

  const ocupado = carregando || excluindo || !listaDisponivel;
  const alertas = estacas.flatMap((estaca) =>
    alertasEstaca(estaca).map((alerta) => ({ ...alerta, estaca })),
  );
  const cargaTotal = estacas.reduce(
    (soma, estaca) => soma + (numero(estaca.cargaPrevistaTf) ?? 0),
    0,
  );
  const tipos = new Set(estacas.map((estaca) => estaca.tipo)).size;

  function recarregar() {
    setCarregando(true);
    setMensagem("");
    setErro("");
    setRevisao((atual) => atual + 1);
  }

  function abrirEditor(estaca = null) {
    setMensagem("");
    setErro("");
    setEditor({ estaca });
  }

  async function salvar(estaca) {
    const salva = estaca.id
      ? await estacasService.atualizar(obraId, estaca)
      : await estacasService.criar(obraId, estaca);
    setEstacas((atuais) =>
      estaca.id
        ? atuais.map((item) => (item.id === salva.id ? salva : item))
        : [...atuais, salva],
    );
    setSelecao(`estaca-${salva.id}`);
    setEditor(null);
    setMensagem(
      estaca.id
        ? "Estaca atualizada com sucesso."
        : "Estaca criada com sucesso.",
    );
    setErro("");
  }

  async function excluir(estaca) {
    if (
      ocupado ||
      !window.confirm(
        `Excluir a estaca ${estaca.nome} desta obra? Esta ação remove o cadastro.`,
      )
    )
      return;
    setExcluindo(true);
    setErro("");
    setMensagem("");
    try {
      await estacasService.remover(obraId, estaca.id);
      setEstacas((atuais) => atuais.filter((item) => item.id !== estaca.id));
      if (selecao === `estaca-${estaca.id}`) setSelecao(null);
      setMensagem("Estaca excluída com sucesso.");
    } catch (error) {
      setErro(error.message || "Não foi possível excluir a estaca.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="estacas-page">
      <header className="estacas-page-header">
        <div>
          <p className="estacas-eyebrow">FUNDAÇÕES / CADASTRO</p>
          <h1>Cadastro de estacas</h1>
          <p>
            Organize a geometria, as cargas e a locação das estacas da obra.
          </p>
        </div>
        <div className="estacas-header-actions">
          <button
            type="button"
            className="estacas-button"
            onClick={recarregar}
            disabled={carregando || excluindo || !!editor}
            aria-label="Atualizar estacas e sondagens"
          >
            <RefreshCw size={15} /> Atualizar
          </button>
          <button
            type="button"
            className="estacas-button estacas-button-primary"
            onClick={() => abrirEditor()}
            disabled={ocupado}
          >
            <Plus size={16} /> Adicionar estaca
          </button>
        </div>
      </header>

      <div className="estacas-metrics">
        <Metric
          icon={Ruler}
          label="Estacas cadastradas"
          value={estacas.length}
          detail="nesta obra"
        />
        <Metric
          icon={Layers3}
          label="Tipos utilizados"
          value={tipos}
          detail="de 5 tipos disponíveis"
        />
        <Metric
          icon={CircleDollarSign}
          label="Carga prevista total"
          value={`${formatarNumero(cargaTotal)} tf`}
          detail="soma das cargas informadas"
        />
      </div>

      {(erro || mensagem) && (
        <div
          className={`estacas-notice ${erro ? "estacas-notice-error" : "estacas-notice-success"}`}
          role={erro ? "alert" : "status"}
        >
          {erro || mensagem}
        </div>
      )}

      <div className="estacas-main-grid">
        <div className="estacas-table-column">
          <section
            className="estacas-card"
            aria-labelledby="estacas-lista-title"
            aria-busy={carregando}
          >
            <header className="estacas-card-header">
              <div>
                <h2 id="estacas-lista-title">
                  Estacas da obra{" "}
                  <span className="estacas-count">{estacas.length}</span>
                </h2>
                <p>Selecione uma estaca para consultar a locação.</p>
              </div>
              <span className="estacas-unit-label">m · cm · tf</span>
            </header>
            {carregando ? (
              <div className="estacas-empty" role="status">
                <RefreshCw size={24} />
                <h3>Carregando estacas…</h3>
              </div>
            ) : !listaDisponivel ? (
              <div className="estacas-empty">
                <AlertTriangle size={27} />
                <h3>Não foi possível consultar o cadastro</h3>
                <p>Atualize a lista para tentar novamente.</p>
                <button
                  type="button"
                  className="estacas-button"
                  onClick={recarregar}
                >
                  Tentar novamente
                </button>
              </div>
            ) : !estacas.length ? (
              <div className="estacas-empty">
                <div className="estacas-empty-icon">
                  <Ruler size={28} />
                </div>
                <h3>Nenhuma estaca cadastrada</h3>
                <p>
                  Adicione a primeira estaca para começar a organizar a fundação
                  desta obra.
                </p>
                <button
                  type="button"
                  className="estacas-button estacas-button-primary"
                  onClick={() => abrirEditor()}
                >
                  <Plus size={16} /> Adicionar estaca
                </button>
              </div>
            ) : (
              <div
                className="estacas-table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Tabela de estacas, deslize para consultar todas as colunas"
              >
                <table className="estacas-table">
                  <caption className="estacas-sr-only">
                    Cadastro completo das estacas da obra
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Nome</th>
                      <th scope="col">X (m)</th>
                      <th scope="col">Y (m)</th>
                      <th scope="col">Tipo de estaca</th>
                      <th scope="col">Ø (cm)</th>
                      <th scope="col">Área (m²)</th>
                      <th scope="col">Perím. (m)</th>
                      <th scope="col">Cap. estrutural (tf)</th>
                      <th scope="col">Arrasamento (m)</th>
                      <th scope="col">Carga prevista (tf)</th>
                      <th scope="col">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estacas.map((estaca) => {
                      const geometria = geometriaEstaca(estaca.diametroCm);
                      const ativa = selecao === `estaca-${estaca.id}`;
                      return (
                        <tr
                          key={estaca.id}
                          className={ativa ? "estacas-row-active" : ""}
                        >
                          <th scope="row">
                            <button
                              type="button"
                              onClick={() => setSelecao(`estaca-${estaca.id}`)}
                              aria-pressed={ativa}
                            >
                              {estaca.nome}
                            </button>
                          </th>
                          <td>{formatarNumero(estaca.coordX, 3)}</td>
                          <td>{formatarNumero(estaca.coordY, 3)}</td>
                          <td className="estacas-type-cell">
                            {nomeTipoEstaca(estaca.tipo)}
                          </td>
                          <td>{formatarNumero(estaca.diametroCm)}</td>
                          <td>{formatarNumero(geometria?.area, 4)}</td>
                          <td>{formatarNumero(geometria?.perimetro, 4)}</td>
                          <td>
                            {formatarNumero(estaca.capacidadeEstruturalTf)}
                          </td>
                          <td>{formatarNumero(estaca.cotaArrasamento, 3)}</td>
                          <td>{formatarNumero(estaca.cargaPrevistaTf)}</td>
                          <td>
                            <div className="estacas-row-actions">
                              <button
                                type="button"
                                className="estacas-icon-button"
                                aria-label={`Editar estaca ${estaca.nome}`}
                                title="Editar estaca"
                                disabled={ocupado}
                                onClick={() => abrirEditor(estaca)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="estacas-icon-button estacas-danger"
                                aria-label={`Excluir estaca ${estaca.nome}`}
                                title="Excluir estaca"
                                disabled={ocupado}
                                onClick={() => excluir(estaca)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {estacas.length > 0 && !carregando && (
              <footer className="estacas-table-footer">
                <span>{estacas.length} estaca(s) cadastrada(s)</span>
                <span>Área de seção circular cheia · perímetro externo</span>
              </footer>
            )}
          </section>

          {alertas.length > 0 && !carregando && (
            <section
              className="estacas-alerts"
              aria-labelledby="estacas-alertas-title"
            >
              <div className="estacas-alerts-title">
                <AlertTriangle size={17} />
                <h2 id="estacas-alertas-title">Pontos de atenção</h2>
                <span>{alertas.length}</span>
              </div>
              <p>
                Os avisos são informativos. O cadastro mantém as capacidades que
                você informou.
              </p>
              <ul>
                {alertas.map((alerta) => (
                  <li key={`${alerta.estaca.id}-${alerta.codigo}`}>
                    <button
                      type="button"
                      onClick={() => setSelecao(`estaca-${alerta.estaca.id}`)}
                    >
                      {alerta.estaca.nome}
                    </button>
                    <span>{alerta.texto}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <MiniMapaLocacao
          obraId={obraId}
          estacas={estacas}
          sondagens={sondagens}
          selecao={selecao}
          onSelecionar={setSelecao}
          onAdicionar={() => abrirEditor()}
          onEditar={abrirEditor}
          onExcluir={excluir}
          ocupado={ocupado}
          erroSondagens={erroSondagens}
          onRecarregarSondagens={recarregar}
        />
      </div>

      {editor && (
        <EstacaForm
          key={editor.estaca?.id ?? "nova"}
          estaca={editor.estaca}
          onSalvar={salvar}
          onFechar={() => setEditor(null)}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="estacas-metric">
      <div className="estacas-metric-top">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
