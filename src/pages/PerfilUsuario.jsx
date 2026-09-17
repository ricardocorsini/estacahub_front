import { BadgeCheck, Building2, IdCard, LockKeyhole } from "lucide-react";

import AccountTabs from "../components/account/AccountTabs";
import { useAuth } from "../context/AuthContext";


function obterIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "US";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes.at(-1)[0]}`.toUpperCase();
}


export default function PerfilUsuario() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Minha conta
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Perfil do usuário
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Consulte seus dados pessoais e profissionais cadastrados.
          </p>
        </header>

        <AccountTabs />
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-800">
        <strong className="font-semibold">Visualização provisória:</strong>{" "}
        os dados do usuário logado já são carregados. A edição e o salvamento
        serão conectados em uma próxima etapa.
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl font-bold text-indigo-700 ring-4 ring-white shadow-md">
              {obterIniciais(usuario?.nome)}
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">
              {usuario?.nome}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500">
              {usuario?.email}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Conta ativa
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plano atual
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Conta gratuita
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Informações de assinatura e cobrança serão exibidas aqui.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <IdCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Informações pessoais
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dados principais usados na identificação da conta.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <ReadOnlyField
                label="Nome completo"
                value={usuario?.nome}
              />
              <ReadOnlyField
                label="E-mail profissional"
                value={usuario?.email}
                type="email"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Informações profissionais
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dados opcionais que poderão aparecer nos relatórios.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <ReadOnlyField
                label="CREA"
                value={usuario?.crea}
                placeholder="Não informado"
              />
              <ReadOnlyField
                label="Empresa"
                value={usuario?.empresa}
                placeholder="Não informada"
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                disabled
                title="Edição disponível em uma próxima etapa"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white opacity-50"
              >
                Salvar alterações
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Senha</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  A alteração de senha será disponibilizada posteriormente.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500 opacity-60"
            >
              Alterar senha
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}


function ReadOnlyField({ label, value, placeholder = "", type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        readOnly
        className="h-11 w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
