import { Settings, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";


const items = [
  { to: "/perfil", label: "Perfil", icon: UserRound },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];


export default function AccountTabs() {
  return (
    <nav className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
