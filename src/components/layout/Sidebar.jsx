import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  MapPin,
  X,
} from "lucide-react";
import { Link, NavLink, useParams } from "react-router-dom";

import BrandMark from "./BrandMark";
import { workspaceNavigation } from "./workspaceNavigation";

export default function Sidebar({
  variante = "desktop",
  recolhido = false,
  onToggle,
  obraAtual,
  carregando,
  erro,
  onNavigate,
  onClose,
}) {
  const { obraId } = useParams();
  const mobile = variante === "mobile";
  const compacto = !mobile && recolhido;
  const navId = mobile
    ? "workspace-navigation-mobile"
    : "workspace-navigation-desktop";
  const nome =
    obraAtual?.nome?.trim() ||
    (carregando
      ? "Carregando obra..."
      : erro
        ? "Cadastro indisponível"
        : "Obra não encontrada");
  const localizacao = obraAtual
    ? obraAtual.localizacao?.trim() || "Localização não informada"
    : carregando
      ? "Consultando cadastro"
      : erro
        ? "Tente carregar novamente"
        : "Selecione outra obra";
  const referencial =
    obraAtual?.sistemaCoordenadas === "utm"
      ? "UTM"
      : obraAtual?.sistemaCoordenadas === "local"
        ? "Local"
        : null;
  const ReferencialIcon = referencial === "UTM" ? Compass : Crosshair;

  return (
    <aside
      className={`workspace-sidebar ${mobile ? "workspace-sidebar-mobile" : "workspace-sidebar-desktop"} ${compacto ? "workspace-sidebar-collapsed" : ""}`}
      aria-label="Menu da obra"
    >
      <div className="workspace-sidebar-top">
        <Link
          to="/dashboard"
          className="workspace-sidebar-brand"
          aria-label="EstacaHub — painel de obras"
          onClick={onNavigate}
          title={compacto ? "EstacaHub — painel de obras" : undefined}
        >
          <BrandMark compact />
          <span className="workspace-sidebar-brand-text">
            EstacaHub<span>Engenharia de fundações</span>
          </span>
        </Link>
        {mobile ? (
          <button
            type="button"
            className="workspace-drawer-close"
            aria-label="Fechar navegação da obra"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="workspace-sidebar-toggle"
            onClick={onToggle}
            aria-expanded={!compacto}
            aria-controls={navId}
            aria-label={
              compacto ? "Expandir menu lateral" : "Recolher menu lateral"
            }
            title={compacto ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {compacto ? (
              <ChevronRight size={14} aria-hidden="true" />
            ) : (
              <ChevronLeft size={14} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <div
        className="workspace-sidebar-project"
        role="group"
        aria-label={`Obra atual: ${nome}`}
        title={compacto ? nome : undefined}
        aria-busy={carregando}
      >
        <div className="workspace-sidebar-project-heading">
          <span className="workspace-sidebar-eyebrow">Obra atual</span>
          <Building2 size={16} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <p className="workspace-sidebar-project-name" title={nome}>
          {nome}
        </p>
        <p className="workspace-sidebar-project-location" title={localizacao}>
          <MapPin size={12} aria-hidden="true" />
          <span>{localizacao}</span>
        </p>
        {obraAtual && (
          <div className="workspace-sidebar-project-meta">
            {obraAtual.numero && (
              <span
                className="workspace-project-number"
                title={`Número da obra: ${obraAtual.numero}`}
              >
                Nº {obraAtual.numero}
              </span>
            )}
            {referencial && (
              <span className="workspace-coordinate-badge">
                <ReferencialIcon size={11} aria-hidden="true" />
                {referencial}
              </span>
            )}
          </div>
        )}
      </div>

      <nav
        id={navId}
        className="workspace-navigation"
        aria-label="Seções da obra"
      >
        {workspaceNavigation.map((grupo) => (
          <div key={grupo.label} className="workspace-navigation-group">
            <p className="workspace-sidebar-section-label">{grupo.label}</p>
            <ul>
              {grupo.items.map(({ slug, label, icon: Icon }) => (
                <li key={slug}>
                  <NavLink
                    to={`/obras/${obraId}/${slug}`}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `workspace-nav-link ${isActive ? "workspace-nav-link-active" : ""}`
                    }
                    aria-label={label}
                    title={compacto ? label : undefined}
                  >
                    <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                    <span className="workspace-nav-label">{label}</span>
                    <span className="workspace-active-dot" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="workspace-sidebar-bottom">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="workspace-back-link"
          aria-label="Todas as obras"
          title={compacto ? "Todas as obras" : undefined}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          <span>Todas as obras</span>
        </Link>
        <p className="workspace-sidebar-caption">Ambiente de trabalho</p>
      </div>
    </aside>
  );
}
