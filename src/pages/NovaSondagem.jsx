export default function NovaSondagem() {
  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cadastro de Sondagem
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Insira os dados do laudo de SPT para análise geotécnica.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">
            Identificação do Furo
          </h2>
        </div>
        
        <div className="p-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm font-medium text-slate-900">
              Formulário em construção
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Em breve: inputs para cota do furo, nível d'água (N.A.), tabela dinâmica de profundidades, NSPT e tipos de solo.
            </p>
          </div>
        </div>
        
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
          <button disabled className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
            Salvar Dados
          </button>
        </div>
      </div>
    </div>
  );
}