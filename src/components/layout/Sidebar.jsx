import { NavLink, useParams } from "react-router-dom";

const workspaceItems = [
  {
    slug: "dados",
    label: "Dados da Obra",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-7" />
      </svg>
    ),
  },
  {
    slug: "relatorios",
    label: "Relatórios",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
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

  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="z-20 hidden w-72 flex-col border-r border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold tracking-wider text-white shadow-sm">
            EC
          </div>

          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900">
              EstacaCalc
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Workspace
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 px-4 py-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Obra aberta
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
            Obra #{obraId}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ambiente de cálculo e documentação
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu da Obra
        </p>

        <nav className="flex flex-col gap-1.5">
          {workspaceItems.map((item) => (
            <NavLink
              key={item.slug}
              to={`/obras/${obraId}/${item.slug}`}
              className={getNavClass}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <NavLink
          to="/"
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Trocar obra
        </NavLink>
      </div>
    </aside>
  );
}