import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/70 px-4 backdrop-blur-xl sm:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Logo - Hidden on Desktop */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-sm">
            EC
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 md:flex">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-xs font-medium text-slate-600">
            Ambiente de Cálculo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NavLink
          to="/nova-sondagem"
          className="hidden md:flex items-center justify-center rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          + Novo Projeto
        </NavLink>

        {/* User Profile Avatar Placeholder */}
        <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 transition-colors hover:bg-slate-200">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="absolute left-0 top-16 flex w-full gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden overflow-x-auto shadow-sm">
        {["/", "/nova-sondagem", "/perfil"].map((path, index) => {
          const labels = ["Visão Geral", "Nova Sondagem", "Perfil"];
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {labels[index]}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}