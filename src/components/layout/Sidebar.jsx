import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

const workspaceItems = [
  {
    slug: "dados",
    label: "Dados da Obra",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
      </svg>
    ),
  },
  {
    slug: "sondagens",
    label: "Sondagens",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    slug: "locacao-mapa",
    label: "Locação / Mapa",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    ),
  },
  {
    slug: "cadastro-estacas",
    label: "Cadastro de Estacas",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 3v18" />
        <path d="M8 7h8" />
        <path d="M8 12h8" />
        <path d="M8 17h8" />
      </svg>
    ),
  },
  {
    slug: "carga-admissivel",
    label: "Carga Admissível",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 3v18" />
        <path d="M6 8h12" />
        <path d="M8 21h8" />
        <path d="M9 8l3-5 3 5" />
      </svg>
    ),
  },
  {
    slug: "resultados",
    label: "Resultados",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-7" />
      </svg>
    ),
  },
  {
    slug: "relatorios",
    label: "Relatórios",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { obraId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`relative z-20 hidden h-screen flex-col border-r border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl md:flex transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Botão de Toggle Flutuante */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-600 focus:outline-none"
        title={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Cabeçalho */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center overflow-hidden whitespace-nowrap">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold tracking-wider text-white shadow-sm">
            EC
          </div>
          {/* Animação de largura e opacidade em vez de unmount */}
          <div className={`transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-32 opacity-100 ml-2.5"}`}>
            <span className="block text-lg font-bold tracking-tight text-slate-900">
              EstacaCalc
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Card da Obra Ativa */}
      <div className="border-b border-slate-100 p-4 shrink-0">
        <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-300 ${isCollapsed ? "h-12" : "h-24"}`}>
          
          {/* Conteúdo Expandido */}
          <div className={`absolute inset-0 flex flex-col justify-center p-4 whitespace-nowrap transition-all duration-300 ${isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Obra aberta
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              Obra #{obraId}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ambiente de cálculo
            </p>
          </div>

          {/* Conteúdo Retraído */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"}`} title={`Obra #${obraId}`}>
            <span className="text-xs font-bold text-slate-600">
              #{obraId}
            </span>
          </div>

        </div>
      </div>

      {/* Navegação */}
      <div className="flex flex-1 flex-col gap-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "h-0 opacity-0 mb-0" : "h-6 opacity-100 mb-2"}`}>
          <p className="px-7 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu da Obra
          </p>
        </div>

        <nav className="flex flex-col gap-1.5 px-4">
          {workspaceItems.map((item) => (
            <NavLink
              key={item.slug}
              to={`/obras/${obraId}/${item.slug}`}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.icon}
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-40 opacity-100 ml-3"}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Rodapé (Trocar Obra) */}
      <div className="border-t border-slate-100 p-4 shrink-0 mt-auto">
        <NavLink
          to="/"
          title={isCollapsed ? "Trocar obra" : undefined}
          className={`flex items-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 ${isCollapsed ? "justify-center px-0" : "px-4"}`}
        >
          <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 ml-0" : "w-32 opacity-100 ml-2"}`}>
            Trocar obra
          </span>
        </NavLink>
      </div>
    </aside>
  );
}