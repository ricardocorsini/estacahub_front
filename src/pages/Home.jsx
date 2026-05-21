export default function Home() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral do sistema de cálculo de capacidade de carga.
        </p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Sondagens Cadastradas" value="0" trend="+0% este mês" />
        <StatCard title="Projetos Analisados" value="0" trend="Nenhum ativo" />
        <StatCard title="Relatórios Gerados" value="0" trend="Aguardando dados" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-800">Próximos Passos de Desenvolvimento</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3"><span className="text-indigo-500">✓</span> Estruturação Base React + Tailwind</li>
              <li className="flex gap-3 opacity-50"><span className="text-slate-300">○</span> Cadastro de Perfis SPT e Camadas de Solo</li>
              <li className="flex gap-3 opacity-50"><span className="text-slate-300">○</span> Métodos Semiempíricos (Aoki-Velloso, etc.)</li>
              <li className="flex gap-3 opacity-50"><span className="text-slate-300">○</span> Autenticação e Banco de Dados</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-indigo-100 bg-indigo-50 shadow-sm justify-center p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Iniciar Novo Cálculo</h3>
          <p className="mt-2 text-sm text-slate-600 mb-6">
            Cadastre os dados geotécnicos do terreno para começar a análise de fundações.
          </p>
          <a
            href="/nova-sondagem"
            className="mx-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Cadastrar Sondagem
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <span className="text-xs font-medium text-slate-400">{trend}</span>
      </div>
    </div>
  );
}