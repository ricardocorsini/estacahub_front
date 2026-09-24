import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import UserMenu from "../components/layout/UserMenu";
import { obrasService } from "../services/obrasService";

function formatarAtualizacao(valor) {
  if (!valor) return "não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

export default function Home() {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [nomeObra, setNomeObra] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    let ativo = true;

    obrasService
      .listar()
      .then((dados) => {
        if (!ativo) return;
        setObras(Array.isArray(dados) ? dados : []);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(error.message || "Não foi possível carregar as obras.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  async function handleCriarObra(event) {
    event.preventDefault();

    const nome = nomeObra.trim();
    if (!nome) return;

    setCriando(true);
    setErro("");

    try {
      const novaObra = await obrasService.criar({
        nome,
        sistemaCoordenadas: "local",
      });

      navigate(`/obras/${novaObra.id}/dados`);
    } catch (error) {
      setErro(error.message || "Não foi possível criar a obra.");
    } finally {
      setCriando(false);
    }
  }

  function tentarNovamente() {
    setCarregando(true);
    setErro("");
    setRecarregar((valor) => valor + 1);
  }

  const obrasRecentes = obras.slice(0, 4);

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />

      <main className="relative z-10 flex min-h-screen w-full flex-col px-4 py-8 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold tracking-wider text-white shadow-sm">
              EC
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                EstacaCalc
              </h1>
              <p className="text-xs text-slate-500">
                Cálculo de capacidade de carga em estacas
              </p>
            </div>
          </div>

          <UserMenu mostrarInicio={false} />
        </header>

        <section className="mb-8 max-w-4xl">
          <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Tela inicial
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Abra uma obra para começar
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Cada cálculo, sondagem, cadastro de estacas e relatório será
            organizado dentro de uma obra.
          </p>
        </section>

        {erro && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{erro}</span>
            <button
              type="button"
              onClick={tentarNovamente}
              className="font-semibold text-red-700 underline underline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">
              Criar nova obra
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Informe apenas o nome da obra para iniciar.
            </p>

            <form onSubmit={handleCriarObra} className="mt-5 space-y-3">
              <input
                value={nomeObra}
                onChange={(event) => setNomeObra(event.target.value)}
                placeholder="Nome da nova obra"
                maxLength={200}
                disabled={criando}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <button
                type="submit"
                disabled={criando}
                className="h-11 w-full rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {criando ? "Criando..." : "Criar obra"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Obras recentes
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Acesse rapidamente as últimas obras cadastradas.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                {obrasRecentes.length}
              </span>
            </div>

            {carregando ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Carregando obras...
              </div>
            ) : obrasRecentes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Nenhuma obra cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {obrasRecentes.map((obra) => (
                  <Link
                    key={obra.id}
                    to={`/obras/${obra.id}/dados`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-md"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {obra.nome}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {obra.localizacao || "Localização não informada"}
                    </p>

                    <p className="mt-4 text-xs font-medium text-indigo-600">
                      Abrir obra
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Obras cadastradas
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Selecione uma obra existente para continuar.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {obras.length}
            </span>
          </div>

          {carregando ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Carregando obras cadastradas...
            </div>
          ) : obras.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Cadastre sua primeira obra para acessar o ambiente de cálculo.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {obras.map((obra) => (
                <div
                  key={obra.id}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {obra.nome}
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      {obra.localizacao || "Localização não informada"} ·
                      Atualizada: {formatarAtualizacao(obra.atualizadoEm)}
                    </p>
                  </div>

                  <Link
                    to={`/obras/${obra.id}/dados`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} EstacaCalc · V 0.1.0-alpha
        </footer>
      </main>
    </div>
  );
}
