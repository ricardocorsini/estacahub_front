import {
  Building2,
  ChevronDown,
  ChevronRight,
  Layers3,
  LoaderCircle,
  Menu,
  RefreshCw,
  Ruler,
  TriangleAlert,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import UserMenu from "./UserMenu";
import { obterPaginaWorkspace } from "./workspaceNavigation";

const comparador = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});

function AtalhosObra({ obraId, disponivel }) {
  const atalhos = [
    { slug: "sondagens", label: "Sondagens", icon: Layers3, primary: true },
    { slug: "cadastro-estacas", label: "Estacas", icon: Ruler, primary: false },
  ];

  return atalhos.map(({ slug, label, icon: Icon, primary }) => {
    const classe = `workspace-action ${primary ? "workspace-action-primary" : "workspace-action-secondary"}`;
    const conteudo = (
      <>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </>
    );
    return disponivel ? (
      <Link
        key={slug}
        to={`/obras/${obraId}/${slug}`}
        className={classe}
        title={`Abrir ${label.toLocaleLowerCase("pt-BR")} da obra`}
      >
        {conteudo}
      </Link>
    ) : (
      <span
        key={slug}
        className={`${classe} workspace-action-disabled`}
        aria-disabled="true"
        title="Selecione uma obra disponível para acessar."
      >
        {conteudo}
      </span>
    );
  });
}

export default function Header({
  obras,
  obraAtual,
  carregandoObras,
  erroObras,
  onAtualizarObras,
  onAbrirMenu,
  menuAberto,
  menuButtonRef,
}) {
  const { obraId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const paginaAtual = obterPaginaWorkspace(pathname);
  const obrasOrdenadas = [...obras].sort((a, b) =>
    comparador.compare(a.nome || "", b.nome || ""),
  );
  const obraAtualId = obraAtual?.id ?? obraId;

  function handleTrocarObra(event) {
    const novaObraId = event.target.value;
    if (novaObraId && novaObraId !== String(obraId))
      navigate(`/obras/${novaObraId}/dados`);
  }

  return (
    <header className="workspace-header">
      <div className="workspace-header-row">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onAbrirMenu}
          className="workspace-menu-button"
          aria-label="Abrir navegação da obra"
          aria-expanded={menuAberto}
          aria-controls="workspace-menu-mobile"
          aria-haspopup="dialog"
        >
          <Menu size={21} strokeWidth={1.7} aria-hidden="true" />
        </button>

        <div className="workspace-project-context">
          <span className="workspace-header-project-icon">
            <Building2 size={19} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div className="workspace-project-text">
            <nav
              className="workspace-breadcrumb"
              aria-label="Localização no workspace"
            >
              <Link to="/dashboard">Obras</Link>
              <ChevronRight size={11} aria-hidden="true" />
              <span aria-current="page">
                {paginaAtual?.label || "Área da obra"}
              </span>
              {carregandoObras && obraAtual && (
                <LoaderCircle
                  size={12}
                  className="workspace-spin"
                  aria-label="Atualizando lista de obras"
                />
              )}
            </nav>
            <div className="workspace-project-select">
              <label
                className="workspace-sr-only"
                htmlFor="workspace-obra-atual"
              >
                Selecionar obra
              </label>
              <select
                id="workspace-obra-atual"
                value={obraAtual ? String(obraAtual.id) : ""}
                onChange={handleTrocarObra}
                disabled={carregandoObras || obras.length === 0}
                title={obraAtual?.nome || undefined}
              >
                {!obraAtual && (
                  <option value="" disabled>
                    {carregandoObras
                      ? "Carregando obras..."
                      : erroObras
                        ? "Lista de obras indisponível"
                        : "Obra não encontrada"}
                  </option>
                )}
                {obrasOrdenadas.map((obra) => (
                  <option key={obra.id} value={String(obra.id)}>
                    {obra.nome || "Obra sem nome"}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="workspace-header-actions">
          <div className="workspace-shortcuts">
            <AtalhosObra obraId={obraAtualId} disponivel={Boolean(obraAtual)} />
          </div>
          <UserMenu />
        </div>
      </div>

      <div className="workspace-mobile-shortcuts">
        <AtalhosObra obraId={obraAtualId} disponivel={Boolean(obraAtual)} />
      </div>

      {erroObras && (
        <div className="workspace-header-feedback" role="alert">
          <TriangleAlert size={15} aria-hidden="true" />
          <p>{erroObras}</p>
          <button type="button" onClick={onAtualizarObras}>
            <RefreshCw size={13} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}
      {!carregandoObras && !erroObras && !obraAtual && (
        <div className="workspace-header-feedback" role="status">
          <TriangleAlert size={15} aria-hidden="true" />
          <p>A obra desta página não foi encontrada na sua lista.</p>
          <Link to="/dashboard">
            Voltar às obras
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
      )}
    </header>
  );
}
