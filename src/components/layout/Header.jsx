import { useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";

const obrasMock = [
  {
    id: "1",
    nome: "Residencial Jardim das Árvores",
    local: "São Luís - MA",
  },
  {
    id: "2",
    nome: "Galpão Industrial BR-135",
    local: "Bacabeira - MA",
  },
  {
    id: "3",
    nome: "Ampliação Escola Municipal",
    local: "Raposa - MA",
  },
];

export default function Header() {
  const { obraId } = useParams();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const obraAtual =
    obrasMock.find((obra) => obra.id === obraId) || obrasMock[0];

  function handleTrocarObra(event) {
    const nextObraId = event.target.value;
    navigate(`/obras/${nextObraId}/dados`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-16 w-full items-center justify-between gap-4">
        {/* Área esquerda */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
              EC
            </div>
          </div>

          {/* Seletor de obra */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 md:flex">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
                Obra aberta
              </p>

              <select
                value={obraAtual.id}
                onChange={handleTrocarObra}
                className="max-w-[210px] truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors hover:bg-slate-50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 sm:max-w-[280px] lg:max-w-[360px]"
              >
                {obrasMock.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status de salvamento */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 lg:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">
              Alterações salvas
            </span>
          </div>
        </div>

        {/* Área direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão nova sondagem */}
          <NavLink
            to={`/obras/${obraAtual.id}/sondagens`}
            className="hidden items-center justify-center rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 md:inline-flex"
          >
            + Nova sondagem
          </NavLink>

          {/* Botão nova estaca */}
          <NavLink
            to={`/obras/${obraAtual.id}/cadastro-estacas`}
            className="hidden items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 md:inline-flex"
          >
            + Nova estaca
          </NavLink>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              aria-label="Abrir menu do usuário"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Engenheiro(a)
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    usuario@email.com
                  </p>
                </div>

                <div className="p-2">
                  <Link
                    to="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                      />
                    </svg>
                    Perfil
                  </Link>

                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.094c.55 0 1.02.398 1.11.94l.149.894c.07.424.35.78.746.944.396.164.85.086 1.2-.163l.738-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.327.805-.163 1.201.164.396.52.676.944.746l.894.149c.542.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.78.35-.944.746-.164.396-.086.85.163 1.2l.527.738c.32.448.269 1.061-.12 1.45l-.774.773a1.125 1.125 0 01-1.45.12l-.737-.527c-.35-.25-.805-.327-1.201-.163-.396.164-.676.52-.746.944l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.35-.78-.746-.944-.396-.164-.85-.086-1.2.163l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.327-.805.163-1.201-.164-.396-.52-.676-.944-.746l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.78-.35.944-.746.164-.396.086-.85-.163-1.2l-.527-.738a1.125 1.125 0 01.12-1.45l.774-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.805.327 1.201.163.396-.164.676-.52.746-.944l.149-.894z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Configurações
                  </button>

                  <Link
                    to="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-7.5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h12m0 0l-3-3m3 3l-3 3"
                      />
                    </svg>
                    Trocar obra
                  </Link>
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
                      />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações mobile */}
      <div className="flex gap-2 border-t border-slate-100 py-3 md:hidden">
        <NavLink
          to={`/obras/${obraAtual.id}/sondagens`}
          className="flex flex-1 items-center justify-center rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
        >
          + Sondagem
        </NavLink>

        <NavLink
          to={`/obras/${obraAtual.id}/cadastro-estacas`}
          className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          + Estaca
        </NavLink>

        <div className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Salvo
        </div>
      </div>
    </header>
  );
}