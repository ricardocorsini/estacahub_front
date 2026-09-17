import {
  ChevronDown,
  House,
  LoaderCircle,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function obterIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "US";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes.at(-1)[0]}`.toUpperCase();
}


export default function UserMenu({ mostrarInicio = true }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { usuario, sair } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAberto(false);
      }
    }

    function fecharComEscape(event) {
      if (event.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  async function handleSair() {
    setSaindo(true);

    try {
      await sair();
      navigate("/login", { replace: true });
    } finally {
      setSaindo(false);
      setAberto(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 text-left shadow-sm transition-colors hover:bg-slate-50"
        aria-label="Abrir menu do usuário"
        aria-expanded={aberto}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
          {obterIniciais(usuario?.nome)}
        </span>
        <span className="hidden max-w-32 sm:block">
          <span className="block truncate text-xs font-semibold text-slate-800">
            {usuario?.nome}
          </span>
          <span className="block text-[10px] text-slate-500">Minha conta</span>
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="truncate text-sm font-semibold text-slate-900">
              {usuario?.nome}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {usuario?.email}
            </p>
          </div>

          <div className="p-2">
            {mostrarInicio && (
              <MenuLink to="/" icon={House} onClick={() => setAberto(false)}>
                Início
              </MenuLink>
            )}
            <MenuLink
              to="/perfil"
              icon={UserRound}
              onClick={() => setAberto(false)}
            >
              Perfil
            </MenuLink>
            <MenuLink
              to="/configuracoes"
              icon={Settings}
              onClick={() => setAberto(false)}
            >
              Configurações
            </MenuLink>
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={handleSair}
              disabled={saindo}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              {saindo ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {saindo ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function MenuLink({ to, icon: Icon, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {children}
    </Link>
  );
}
