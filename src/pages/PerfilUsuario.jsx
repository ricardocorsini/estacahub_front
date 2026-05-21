export default function PerfilUsuario() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Perfil do Usuário
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie suas preferências e informações profissionais.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
              EU
            </div>
            <h3 className="text-base font-semibold text-slate-900">Engenheiro(a)</h3>
            <p className="text-xs text-slate-500">Conta Gratuita</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800">Informações Pessoais</h2>
            </div>
            <div className="p-6 grid gap-4 sm:grid-cols-2">
              <PlaceholderInput label="Nome Completo" />
              <PlaceholderInput label="Email Profissional" />
              <PlaceholderInput label="CREA (Opcional)" />
              <PlaceholderInput label="Empresa" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-800">Preferências de Cálculo</h2>
            </div>
            <div className="p-6">
               <p className="text-sm text-slate-500">Módulos de configuração de unidades (kN, tf) e coeficientes de segurança virão aqui.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderInput({ label }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 cursor-not-allowed"></div>
    </div>
  );
}