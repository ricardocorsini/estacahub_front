export default function WorkspacePlaceholder({
  title,
  description,
  badge = "Em construção",
}) {
  return (
    <div className="space-y-6">
      <header>
        <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {badge}
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Tela ainda sem conteúdo
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Esta área foi criada apenas para organizar a navegação inicial do
            workspace. Nos próximos passos, os formulários, tabelas, gráficos e
            relatórios serão adicionados aqui.
          </p>
        </div>
      </section>
    </div>
  );
}