import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import {
  OBRAS_ATUALIZADAS_EVENT,
  obrasService,
} from "../../services/obrasService";
import UserMenu from "./UserMenu";

export default function Header() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [carregandoObras, setCarregandoObras] = useState(true);
  const [erroObras, setErroObras] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarObras = () => {
      obrasService
        .listar()
        .then((dados) => {
          if (!ativo) return;
          setObras(Array.isArray(dados) ? dados : []);
          setErroObras("");
        })
        .catch((error) => {
          if (!ativo) return;
          setErroObras(error.message || "Não foi possível carregar as obras.");
        })
        .finally(() => {
          if (ativo) setCarregandoObras(false);
        });
    };

    carregarObras();
    window.addEventListener(OBRAS_ATUALIZADAS_EVENT, carregarObras);

    return () => {
      ativo = false;
      window.removeEventListener(OBRAS_ATUALIZADAS_EVENT, carregarObras);
    };
  }, []);

  const obraAtual = obras.find((obra) => String(obra.id) === String(obraId));
  const obraAtualId = obraAtual?.id ?? obraId;

  function handleTrocarObra(event) {
    const novaObraId = event.target.value;
    if (!novaObraId) return;

    navigate(`/obras/${novaObraId}/dados`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-16 w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
              EC
            </div>
          </div>

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
                value={obraAtual ? String(obraAtual.id) : ""}
                onChange={handleTrocarObra}
                disabled={carregandoObras || obras.length === 0}
                title={erroObras || undefined}
                className="max-w-[180px] truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors hover:bg-slate-50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 sm:max-w-[260px] lg:max-w-[360px]"
              >
                {!obraAtual && (
                  <option value="">
                    {carregandoObras
                      ? "Carregando obras..."
                      : "Obra não encontrada"}
                  </option>
                )}
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {erroObras ? (
            <div className="hidden items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 xl:flex">
              Falha ao carregar obras
            </div>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 xl:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">
                Obra sincronizada
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NavLink
            to={`/obras/${obraAtualId}/sondagens`}
            className="hidden items-center justify-center rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 lg:inline-flex"
          >
            + Nova sondagem
          </NavLink>

          <NavLink
            to={`/obras/${obraAtualId}/cadastro-estacas`}
            className="hidden items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 lg:inline-flex"
          >
            + Nova estaca
          </NavLink>

          <UserMenu />
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 py-3 md:hidden">
        <NavLink
          to={`/obras/${obraAtualId}/sondagens`}
          className="flex flex-1 items-center justify-center rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
        >
          + Sondagem
        </NavLink>

        <NavLink
          to={`/obras/${obraAtualId}/cadastro-estacas`}
          className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          + Estaca
        </NavLink>

        <div className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sincronizada
        </div>
      </div>
    </header>
  );
}
