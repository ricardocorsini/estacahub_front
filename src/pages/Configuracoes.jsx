import {
  Bell,
  Calculator,
  ChevronRight,
  LockKeyhole,
  MonitorCog,
} from "lucide-react";

import AccountTabs from "../components/account/AccountTabs";
import { useAuth } from "../context/AuthContext";


export default function Configuracoes() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Minha conta
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Preferências gerais da plataforma e da sua sessão.
          </p>
        </header>

        <AccountTabs />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <strong className="font-semibold">Página demonstrativa:</strong>{" "}
        os controles abaixo apresentam a estrutura planejada, mas ainda não
        salvam preferências no banco de dados.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          icon={Calculator}
          title="Padrões de cálculo"
          description="Unidades e apresentação numérica usadas nos módulos."
        >
          <MockSelect label="Sistema de unidades" value="SI — kN, m e MPa" />
          <MockSelect label="Casas decimais" value="3 casas decimais" />
          <MockSelect label="Separador decimal" value="Vírgula (1,25)" />
        </SettingsCard>

        <SettingsCard
          icon={MonitorCog}
          title="Aparência"
          description="Preferências visuais para o ambiente de trabalho."
        >
          <MockSelect label="Tema" value="Claro" />
          <MockSwitch
            label="Interface compacta"
            description="Reduz espaçamentos em tabelas e formulários."
          />
          <MockSwitch
            label="Manter menu lateral recolhido"
            description="Usa mais espaço horizontal para os cálculos."
          />
        </SettingsCard>

        <SettingsCard
          icon={Bell}
          title="Notificações"
          description="Defina quais avisos deseja receber futuramente."
        >
          <MockSwitch
            label="Atualizações do sistema"
            description="Novos recursos, melhorias e manutenções."
            checked
          />
          <MockSwitch
            label="Avisos de processamento"
            description="Conclusão de relatórios e rotinas demoradas."
            checked
          />
        </SettingsCard>

        <SettingsCard
          icon={LockKeyhole}
          title="Segurança e sessão"
          description="Informações da conta atualmente autenticada."
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sessão atual
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {usuario?.nome}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{usuario?.email}</p>
          </div>

          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500 opacity-60"
          >
            Alterar senha
            <ChevronRight className="h-4 w-4" />
          </button>
        </SettingsCard>
      </div>
    </div>
  );
}


function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </section>
  );
}


function MockSelect({ label, value }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <select
        value={value}
        disabled
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-600 opacity-100"
      >
        <option>{value}</option>
      </select>
    </label>
  );
}


function MockSwitch({ label, description, checked = false }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          checked ? "bg-indigo-300" : "bg-slate-200"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </div>
  );
}
