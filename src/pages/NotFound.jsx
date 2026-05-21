import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl bg-slate-100 p-6 mb-6">
        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Página não encontrada
      </h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        A rota solicitada não está disponível no sistema ou ainda não foi implementada neste módulo.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}