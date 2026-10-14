import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { useWorkspaceObras } from "../../hooks/useWorkspaceObras";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Workspace.css";

const SIDEBAR_STORAGE_KEY = "estacahub:sidebar-recolhida";

function lerPreferenciaSidebar() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function AppLayout() {
  const { obraId } = useParams();
  const { pathname } = useLocation();
  const { obras, carregandoObras, erroObras, atualizarObras } =
    useWorkspaceObras();
  const [sidebarRecolhida, setSidebarRecolhida] = useState(
    lerPreferenciaSidebar,
  );
  const [menuAberto, setMenuAberto] = useState(false);
  const menuDialogRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mainRef = useRef(null);
  const obraAtual = obras.find((obra) => String(obra.id) === String(obraId));

  function alternarSidebar() {
    const proximo = !sidebarRecolhida;
    setSidebarRecolhida(proximo);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(proximo));
    } catch {
      /* A navegação continua disponível se o armazenamento estiver bloqueado. */
    }
  }

  function abrirMenu() {
    if (menuDialogRef.current.open) return;
    menuDialogRef.current.showModal();
    setMenuAberto(true);
    menuDialogRef.current.querySelector("button")?.focus();
  }

  function fecharMenu() {
    if (menuDialogRef.current.open) menuDialogRef.current.close();
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
    )
      fecharMenu();
  }

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
    if (menuDialogRef.current?.open) menuDialogRef.current.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    function fecharNoDesktop() {
      if (desktop.matches && menuDialogRef.current?.open)
        menuDialogRef.current.close();
    }
    desktop.addEventListener("change", fecharNoDesktop);
    return () => desktop.removeEventListener("change", fecharNoDesktop);
  }, []);

  return (
    <div
      className={`workspace-shell ${sidebarRecolhida ? "workspace-shell-collapsed" : ""}`}
    >
      <a href="#workspace-conteudo" className="workspace-skip-link">
        Ir para o conteúdo da obra
      </a>

      <Sidebar
        recolhido={sidebarRecolhida}
        onToggle={alternarSidebar}
        obraAtual={obraAtual}
        carregando={carregandoObras}
        erro={erroObras}
      />

      <div className="workspace-main-column">
        <Header
          obras={obras}
          obraAtual={obraAtual}
          carregandoObras={carregandoObras}
          erroObras={erroObras}
          onAtualizarObras={atualizarObras}
          onAbrirMenu={abrirMenu}
          menuAberto={menuAberto}
          menuButtonRef={menuButtonRef}
        />
        <main
          ref={mainRef}
          id="workspace-conteudo"
          tabIndex={-1}
          className="workspace-content"
        >
          <div className="workspace-page-content">
            <Outlet />
          </div>
          <footer className="workspace-footer">
            <span>© {new Date().getFullYear()} EstacaHub</span>
            <span>Engenharia de fundações, organizada.</span>
          </footer>
        </main>
      </div>

      <dialog
        ref={menuDialogRef}
        id="workspace-menu-mobile"
        className="workspace-mobile-drawer"
        aria-label="Navegação da obra"
        onClick={fecharPeloFundo}
        onClose={() => {
          setMenuAberto(false);
          menuButtonRef.current?.focus();
        }}
      >
        <Sidebar
          variante="mobile"
          obraAtual={obraAtual}
          carregando={carregandoObras}
          erro={erroObras}
          onNavigate={fecharMenu}
          onClose={fecharMenu}
        />
      </dialog>
    </div>
  );
}
