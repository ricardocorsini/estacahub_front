import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  FolderOpen,
  FolderPlus,
  LayoutGrid,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
  X,
} from "lucide-react";

import BrandMark from "../components/layout/BrandMark";
import UserMenu from "../components/layout/UserMenu";
import { useAuth } from "../context/AuthContext";
import { obrasService } from "../services/obrasService";
import "./Dashboard.css";

const OBRAS_POR_PAGINA = 8;
const comparador = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});
const formatoData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function timestamp(valor) {
  if (!valor) return 0;
  const resultado = new Date(valor).getTime();
  return Number.isNaN(resultado) ? 0 : resultado;
}

function formatarAtualizacao(valor, comHora = false) {
  if (!timestamp(valor)) return "Não informada";
  return (comHora ? formatoDataHora : formatoData).format(new Date(valor));
}

function nomeDaObra(obra) {
  return obra.nome?.trim() || "Obra sem nome";
}

function Referencial({ sistema }) {
  const local = sistema === "local";
  const utm = sistema === "utm";
  const Icon = utm ? Compass : Crosshair;

  return (
    <span
      className={`dashboard-referencial ${utm ? "dashboard-referencial-utm" : ""}`}
    >
      <Icon size={13} aria-hidden="true" />
      {local ? "Local" : utm ? "UTM" : "Não informado"}
    </span>
  );
}

function Indicador({ icon: Icon, titulo, valor, detalhe, destaque = false }) {
  return (
    <div
      className={`dashboard-indicador ${destaque ? "dashboard-indicador-destaque" : ""}`}
    >
      <div className="dashboard-indicador-heading">
        <span>{titulo}</span>
        <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="dashboard-indicador-value">{valor}</div>
      <p>{detalhe}</p>
    </div>
  );
}

function ObraRecente({ obra }) {
  return (
    <Link to={`/obras/${obra.id}/dados`} className="dashboard-recente">
      <div className="dashboard-recente-top">
        <span className="dashboard-obra-icon">
          <Building2 size={19} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <Referencial sistema={obra.sistemaCoordenadas} />
      </div>
      <h3 title={nomeDaObra(obra)}>{nomeDaObra(obra)}</h3>
      <p
        className="dashboard-recente-local"
        title={obra.localizacao || undefined}
      >
        <MapPin size={13} aria-hidden="true" />
        <span>{obra.localizacao?.trim() || "Localização não informada"}</span>
      </p>
      <div className="dashboard-recente-bottom">
        <span>Atualização: {formatarAtualizacao(obra.atualizadoEm)}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const dialogRef = useRef(null);
  const nomeInputRef = useRef(null);
  const [obras, setObras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroObras, setErroObras] = useState("");
  const [recarregar, setRecarregar] = useState(0);
  const [busca, setBusca] = useState("");
  const [referencial, setReferencial] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("atualizacao");
  const [pagina, setPagina] = useState(1);
  const [nomeObra, setNomeObra] = useState("");
  const [sistemaCoordenadas, setSistemaCoordenadas] = useState("local");
  const [criando, setCriando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState("");

  useEffect(() => {
    let ativo = true;

    obrasService
      .listar()
      .then((dados) => {
        if (!ativo) return;
        if (!Array.isArray(dados))
          throw new Error(
            "Não foi possível carregar as obras. Tente novamente.",
          );
        setObras(dados);
      })
      .catch((error) => {
        if (ativo)
          setErroObras(error.message || "Não foi possível carregar as obras.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  function atualizarObras() {
    setCarregando(true);
    setErroObras("");
    setRecarregar((valor) => valor + 1);
  }

  function abrirNovaObra() {
    setNomeObra("");
    setSistemaCoordenadas("local");
    setErroCriacao("");
    dialogRef.current.showModal();
    nomeInputRef.current.focus();
  }

  function fecharNovaObra() {
    if (!criando) dialogRef.current.close();
  }

  function fecharPeloFundo(event) {
    if (event.target !== event.currentTarget) return;
    const { left, right, top, bottom } =
      event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < left ||
      event.clientX > right ||
      event.clientY < top ||
      event.clientY > bottom
    ) {
      fecharNovaObra();
    }
  }

  async function handleCriarObra(event) {
    event.preventDefault();
    if (criando) return;

    const nome = nomeObra.trim();
    if (!nome) {
      setErroCriacao("Informe o nome da obra.");
      nomeInputRef.current.focus();
      return;
    }

    setCriando(true);
    setErroCriacao("");

    try {
      const novaObra = await obrasService.criar({ nome, sistemaCoordenadas });
      if (novaObra?.id == null)
        throw new Error(
          "Não foi possível abrir a nova obra. Atualize a lista antes de tentar novamente.",
        );
      navigate(`/obras/${novaObra.id}/dados`);
    } catch (error) {
      setErroCriacao(error.message || "Não foi possível criar a obra.");
    } finally {
      setCriando(false);
    }
  }

  function limparFiltros() {
    setBusca("");
    setReferencial("todos");
    setPagina(1);
  }

  const dadosDisponiveis = !carregando && !erroObras;
  const obrasPorAtualizacao = [...obras].sort(
    (a, b) => timestamp(b.atualizadoEm) - timestamp(a.atualizadoEm),
  );
  const obrasRecentes = obrasPorAtualizacao.slice(0, 3);
  const termosBusca = normalizarTexto(busca)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const obrasFiltradas = obras
    .filter((obra) => {
      const texto = normalizarTexto(
        [
          obra.nome,
          obra.numero,
          obra.localizacao,
          obra.responsavelTecnico,
        ].join(" "),
      );
      return (
        termosBusca.every((termo) => texto.includes(termo)) &&
        (referencial === "todos" || obra.sistemaCoordenadas === referencial)
      );
    })
    .sort((a, b) =>
      ordenacao === "nome"
        ? comparador.compare(nomeDaObra(a), nomeDaObra(b))
        : timestamp(b.atualizadoEm) - timestamp(a.atualizadoEm),
    );
  const totalPaginas = Math.max(
    1,
    Math.ceil(obrasFiltradas.length / OBRAS_POR_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicioPagina = (paginaAtual - 1) * OBRAS_POR_PAGINA;
  const obrasDaPagina = obrasFiltradas.slice(
    inicioPagina,
    inicioPagina + OBRAS_POR_PAGINA,
  );
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0];

  return (
    <div className="dashboard-page">
      <a href="#dashboard-conteudo" className="dashboard-skip-link">
        Ir para o conteúdo
      </a>

      <header className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">
          <Link
            to="/"
            className="dashboard-brand"
            aria-label="EstacaHub — página inicial"
          >
            <BrandMark />
            <span>EstacaHub</span>
          </Link>
          <nav className="dashboard-nav" aria-label="Navegação do painel">
            <Link to="/dashboard" aria-current="page">
              <LayoutGrid size={15} aria-hidden="true" />
              Visão geral
            </Link>
            <a href="#minhas-obras">
              <FolderOpen size={15} aria-hidden="true" />
              Minhas obras
            </a>
          </nav>
          <UserMenu mostrarInicio={false} />
        </div>
      </header>

      <main
        id="dashboard-conteudo"
        tabIndex={-1}
        className="dashboard-container dashboard-main"
      >
        <div className="dashboard-breadcrumb">
          <span>Área de trabalho</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span>Visão geral</span>
        </div>

        <section className="dashboard-intro" aria-labelledby="dashboard-titulo">
          <div>
            <p className="dashboard-eyebrow">PROJETOS DE FUNDAÇÕES</p>
            <h1 id="dashboard-titulo">
              Painel de obras<span>.</span>
            </h1>
            <p className="dashboard-intro-text">
              {primeiroNome ? `Olá, ${primeiroNome}. ` : ""}Organize seus
              projetos e continue de onde parou.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirNovaObra}
            className="dashboard-button dashboard-button-primary"
          >
            <Plus size={17} aria-hidden="true" />
            Nova obra
          </button>
        </section>

        <section
          className="dashboard-indicadores"
          aria-label="Resumo das obras"
          aria-busy={carregando}
        >
          <Indicador
            icon={Building2}
            titulo="Obras cadastradas"
            valor={dadosDisponiveis ? obras.length : "—"}
            detalhe="Todos os seus projetos"
            destaque
          />
          <Indicador
            icon={Crosshair}
            titulo="Referencial local"
            valor={
              dadosDisponiveis
                ? obras.filter((obra) => obra.sistemaCoordenadas === "local")
                    .length
                : "—"
            }
            detalhe="Sistema de coordenadas local"
          />
          <Indicador
            icon={Compass}
            titulo="Referencial UTM"
            valor={
              dadosDisponiveis
                ? obras.filter((obra) => obra.sistemaCoordenadas === "utm")
                    .length
                : "—"
            }
            detalhe="Sistema de coordenadas UTM"
          />
        </section>

        {(carregando || (dadosDisponiveis && obrasRecentes.length > 0)) && (
          <section
            className="dashboard-recentes"
            aria-labelledby="recentes-titulo"
            aria-busy={carregando}
          >
            <div className="dashboard-section-heading">
              <div>
                <h2 id="recentes-titulo">Retomar uma obra</h2>
                <p>Últimas atualizações do cadastro.</p>
              </div>
              <a href="#minhas-obras" className="dashboard-text-link">
                Ver todas
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
            <div className="dashboard-recentes-grid">
              {carregando
                ? [0, 1, 2].map((indice) => (
                    <div
                      key={indice}
                      className="dashboard-recente dashboard-skeleton-card"
                      aria-hidden="true"
                    >
                      <span className="dashboard-skeleton" />
                      <span className="dashboard-skeleton" />
                      <span className="dashboard-skeleton" />
                    </div>
                  ))
                : obrasRecentes.map((obra) => (
                    <ObraRecente key={obra.id} obra={obra} />
                  ))}
            </div>
          </section>
        )}

        <section
          id="minhas-obras"
          className="dashboard-obras"
          aria-labelledby="obras-titulo"
          aria-busy={carregando}
        >
          <div className="dashboard-obras-heading">
            <div className="dashboard-obras-title">
              <FolderOpen size={19} strokeWidth={1.7} aria-hidden="true" />
              <h2 id="obras-titulo">Minhas obras</h2>
              {dadosDisponiveis && (
                <span className="dashboard-count">{obras.length}</span>
              )}
            </div>
            <button
              type="button"
              onClick={atualizarObras}
              disabled={carregando}
              className="dashboard-refresh"
              aria-label="Atualizar lista de obras"
            >
              <RefreshCw
                size={14}
                className={carregando ? "dashboard-spin" : ""}
                aria-hidden="true"
              />
              <span>Atualizar</span>
            </button>
          </div>

          <div className="dashboard-toolbar">
            <div className="dashboard-search">
              <Search size={16} aria-hidden="true" />
              <label className="dashboard-sr-only" htmlFor="buscar-obras">
                Buscar obras por nome, número, localização ou responsável
              </label>
              <input
                id="buscar-obras"
                type="search"
                placeholder="Buscar por obra, local ou responsável..."
                value={busca}
                disabled={!dadosDisponiveis || obras.length === 0}
                onChange={(event) => {
                  setBusca(event.target.value);
                  setPagina(1);
                }}
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setPagina(1);
                  }}
                  aria-label="Limpar busca"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="dashboard-filter-controls">
              <div
                className="dashboard-filter-tabs"
                role="group"
                aria-label="Filtrar por sistema de coordenadas"
              >
                {[
                  { valor: "todos", nome: "Todas" },
                  { valor: "local", nome: "Local" },
                  { valor: "utm", nome: "UTM" },
                ].map((filtro) => (
                  <button
                    key={filtro.valor}
                    type="button"
                    aria-pressed={referencial === filtro.valor}
                    disabled={!dadosDisponiveis || obras.length === 0}
                    onClick={() => {
                      setReferencial(filtro.valor);
                      setPagina(1);
                    }}
                  >
                    {filtro.nome}
                  </button>
                ))}
              </div>
              <div className="dashboard-sort">
                <ArrowDownWideNarrow size={14} aria-hidden="true" />
                <label className="dashboard-sr-only" htmlFor="ordenar-obras">
                  Ordenar obras
                </label>
                <select
                  id="ordenar-obras"
                  value={ordenacao}
                  disabled={!dadosDisponiveis || obras.length === 0}
                  onChange={(event) => {
                    setOrdenacao(event.target.value);
                    setPagina(1);
                  }}
                >
                  <option value="atualizacao">Mais recentes</option>
                  <option value="nome">Nome (A–Z)</option>
                </select>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="dashboard-loading" role="status">
              <LoaderCircle
                size={20}
                className="dashboard-spin"
                aria-hidden="true"
              />
              <span>Carregando suas obras...</span>
            </div>
          ) : erroObras ? (
            <div className="dashboard-empty dashboard-error" role="alert">
              <span className="dashboard-state-icon">
                <TriangleAlert size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Não foi possível carregar as obras</h3>
              <p>{erroObras}</p>
              <button
                type="button"
                onClick={atualizarObras}
                className="dashboard-button dashboard-button-secondary"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Tentar novamente
              </button>
            </div>
          ) : obras.length === 0 ? (
            <div className="dashboard-empty">
              <span className="dashboard-state-icon">
                <FolderPlus size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Seu espaço está pronto para a primeira obra</h3>
              <p>
                Crie uma obra para reunir os dados do projeto e as sondagens em
                um só lugar.
              </p>
              <button
                type="button"
                onClick={abrirNovaObra}
                className="dashboard-button dashboard-button-primary"
              >
                <Plus size={16} aria-hidden="true" />
                Criar primeira obra
              </button>
            </div>
          ) : obrasFiltradas.length === 0 ? (
            <div className="dashboard-empty">
              <span className="dashboard-state-icon">
                <SearchX size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Nenhuma obra encontrada</h3>
              <p>
                Ajuste a busca ou o referencial de coordenadas para encontrar
                sua obra.
              </p>
              <button
                type="button"
                onClick={limparFiltros}
                className="dashboard-button dashboard-button-secondary"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <table className="dashboard-table">
                <caption className="dashboard-sr-only">
                  Obras cadastradas com localização, responsável, sistema de
                  coordenadas e data da última atualização.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Obra / localização</th>
                    <th scope="col">Responsável técnico</th>
                    <th scope="col">Referencial</th>
                    <th scope="col">Atualização</th>
                    <th scope="col">
                      <span className="dashboard-sr-only">Acesso à obra</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {obrasDaPagina.map((obra) => (
                    <tr key={obra.id}>
                      <td className="dashboard-table-obra-cell">
                        <div className="dashboard-table-obra">
                          <span className="dashboard-table-icon">
                            <Building2
                              size={18}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </span>
                          <div className="dashboard-table-obra-text">
                            <Link
                              to={`/obras/${obra.id}/dados`}
                              title={nomeDaObra(obra)}
                            >
                              {nomeDaObra(obra)}
                            </Link>
                            <p title={obra.localizacao || undefined}>
                              {obra.numero && (
                                <span>
                                  Nº {obra.numero}
                                  <span aria-hidden="true"> · </span>
                                </span>
                              )}
                              {obra.localizacao?.trim() ||
                                "Localização não informada"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        data-label="Responsável"
                        className="dashboard-table-responsavel"
                      >
                        <span title={obra.responsavelTecnico || undefined}>
                          {obra.responsavelTecnico?.trim() || "Não informado"}
                        </span>
                      </td>
                      <td data-label="Referencial">
                        <Referencial sistema={obra.sistemaCoordenadas} />
                      </td>
                      <td
                        data-label="Atualização"
                        className="dashboard-table-data"
                      >
                        <span
                          title={formatarAtualizacao(obra.atualizadoEm, true)}
                        >
                          {formatarAtualizacao(obra.atualizadoEm)}
                        </span>
                      </td>
                      <td className="dashboard-table-action">
                        <Link
                          to={`/obras/${obra.id}/dados`}
                          aria-label={`Abrir obra ${nomeDaObra(obra)}`}
                        >
                          Abrir
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="dashboard-pagination">
                <p role="status" aria-live="polite">
                  {inicioPagina + 1}–
                  {Math.min(
                    inicioPagina + OBRAS_POR_PAGINA,
                    obrasFiltradas.length,
                  )}{" "}
                  de {obrasFiltradas.length}{" "}
                  {obrasFiltradas.length === 1 ? "obra" : "obras"}
                  {(busca || referencial !== "todos") &&
                    (obrasFiltradas.length === 1
                      ? " encontrada"
                      : " encontradas")}
                </p>
                {totalPaginas > 1 && (
                  <nav aria-label="Páginas da lista de obras">
                    <button
                      type="button"
                      disabled={paginaAtual === 1}
                      onClick={() => setPagina(paginaAtual - 1)}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <span>
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={paginaAtual === totalPaginas}
                      onClick={() => setPagina(paginaAtual + 1)}
                      aria-label="Próxima página"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </section>

        <div className="dashboard-context-note">
          <Check size={14} aria-hidden="true" />
          <p>Dados de projeto e sondagens organizados por obra.</p>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="dashboard-container">
          <span>© {new Date().getFullYear()} EstacaHub</span>
          <span>Engenharia de fundações, organizada.</span>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="dashboard-modal"
        aria-labelledby="nova-obra-titulo"
        aria-describedby="nova-obra-descricao"
        onClick={fecharPeloFundo}
        onCancel={(event) => {
          if (criando) event.preventDefault();
        }}
      >
        <div className="dashboard-modal-heading">
          <span className="dashboard-modal-icon">
            <Building2 size={22} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={fecharNovaObra}
            disabled={criando}
            aria-label="Fechar nova obra"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <h2 id="nova-obra-titulo">Nova obra</h2>
        <p id="nova-obra-descricao">
          Crie o projeto e complete os dados técnicos no ambiente da obra.
        </p>
        <form onSubmit={handleCriarObra} aria-busy={criando}>
          <div className="dashboard-field">
            <label htmlFor="nome-nova-obra">
              Nome da obra <span>*</span>
            </label>
            <input
              ref={nomeInputRef}
              id="nome-nova-obra"
              name="nome"
              autoFocus
              autoComplete="off"
              placeholder="Ex.: Edifício Jardim Atlântico"
              value={nomeObra}
              onChange={(event) => {
                setNomeObra(event.target.value);
                setErroCriacao("");
              }}
              maxLength={200}
              disabled={criando}
              required
              aria-invalid={
                Boolean(erroCriacao && !nomeObra.trim()) || undefined
              }
              aria-describedby={erroCriacao ? "nova-obra-erro" : undefined}
            />
          </div>
          <fieldset className="dashboard-coordinate-field" disabled={criando}>
            <legend>Sistema de coordenadas</legend>
            <div>
              {[
                {
                  valor: "local",
                  titulo: "Local",
                  descricao: "Referencial do projeto",
                  icon: Crosshair,
                },
                {
                  valor: "utm",
                  titulo: "UTM",
                  descricao: "Referencial geográfico",
                  icon: Compass,
                },
              ].map(({ valor, titulo, descricao, icon: Icon }) => (
                <label key={valor}>
                  <input
                    type="radio"
                    name="sistema-coordenadas"
                    value={valor}
                    checked={sistemaCoordenadas === valor}
                    onChange={() => setSistemaCoordenadas(valor)}
                  />
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                  <span>
                    <strong>{titulo}</strong>
                    <small>{descricao}</small>
                  </span>
                </label>
              ))}
            </div>
            <p>Você pode ajustar o referencial nos dados da obra.</p>
          </fieldset>
          {erroCriacao && (
            <p
              id="nova-obra-erro"
              className="dashboard-form-error"
              role="alert"
            >
              <TriangleAlert size={16} aria-hidden="true" />
              {erroCriacao}
            </p>
          )}
          <div className="dashboard-modal-actions">
            <button
              type="button"
              onClick={fecharNovaObra}
              disabled={criando}
              className="dashboard-button dashboard-button-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={criando}
              className="dashboard-button dashboard-button-primary"
            >
              {criando ? (
                <LoaderCircle
                  size={16}
                  className="dashboard-spin"
                  aria-hidden="true"
                />
              ) : (
                <Plus size={16} aria-hidden="true" />
              )}
              {criando ? "Criando obra..." : "Criar obra"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
