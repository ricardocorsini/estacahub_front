import { useMemo, useState } from "react";
import PerfilSondagem from "../../components/workspace/sondagens/PerfilSondagem";
import {
  TIPOS_SOLO,
  obterConfigFamilia,
  obterFamiliaSolo,
} from "../../components/workspace/sondagens/soloConfig";

const LEITURAS_SP01 = [
  { id: 1, profundidade: 1, cota: 14.5, nspt: 5, solo: "Argila", familia: "Coesivo" },
  { id: 2, profundidade: 2, cota: 13.5, nspt: 8, solo: "Argila", familia: "Coesivo" },
  { id: 3, profundidade: 3, cota: 12.5, nspt: 10, solo: "Argila Silto-arenosa", familia: "Coesivo" },
  { id: 4, profundidade: 4, cota: 11.5, nspt: 13, solo: "Argila Silto-arenosa", familia: "Coesivo" },
  { id: 5, profundidade: 5, cota: 10.5, nspt: 16, solo: "Silte Arenoso", familia: "Intermediário" },
  { id: 6, profundidade: 6, cota: 9.5, nspt: 21, solo: "Silte Arenoso", familia: "Intermediário" },
  { id: 7, profundidade: 7, cota: 8.5, nspt: 27, solo: "Areia Siltosa", familia: "Granular" },
  { id: 8, profundidade: 8, cota: 7.5, nspt: 34, solo: "Areia Siltosa", familia: "Granular" },
  { id: 9, profundidade: 9, cota: 6.5, nspt: 41, solo: "Areia", familia: "Granular" },
  { id: 10, profundidade: 10, cota: 5.5, nspt: 48, solo: "Areia", familia: "Granular" },
  { id: 11, profundidade: 11, cota: 4.5, nspt: 50, solo: "Areia", familia: "Granular" },
  { id: 12, profundidade: 12, cota: 3.5, nspt: 50, solo: "Areia", familia: "Granular" },
];

const LEITURAS_SP02 = [
  { id: 21, profundidade: 1, cota: 14.2, nspt: 4, solo: "Argila Siltosa", familia: "Coesivo" },
  { id: 22, profundidade: 2, cota: 13.2, nspt: 6, solo: "Argila Siltosa", familia: "Coesivo" },
  { id: 23, profundidade: 3, cota: 12.2, nspt: 9, solo: "Silte Argiloso", familia: "Intermediário" },
  { id: 24, profundidade: 4, cota: 11.2, nspt: 12, solo: "Silte Argiloso", familia: "Intermediário" },
  { id: 25, profundidade: 5, cota: 10.2, nspt: 17, solo: "Areia Argilosa", familia: "Granular" },
  { id: 26, profundidade: 6, cota: 9.2, nspt: 24, solo: "Areia Argilosa", familia: "Granular" },
  { id: 27, profundidade: 7, cota: 8.2, nspt: 31, solo: "Areia", familia: "Granular" },
  { id: 28, profundidade: 8, cota: 7.2, nspt: 39, solo: "Areia", familia: "Granular" },
];

const criarCabecalhoVazio = () => ({
  cotaBoca: "",
  profundidadeFinal: "",
  criterio: "",
  nivelAgua: "",
  coordX: "",
  coordY: "",
});

const SONDAGENS_INICIAIS = [
  {
    id: 1,
    nome: "SP-01",
    dadosCabecalho: {
      cotaBoca: 15.5,
      profundidadeFinal: 12,
      criterio: "Impenetrável",
      nivelAgua: 3.5,
      coordX: 543210,
      coordY: 9876540,
    },
    leituras: LEITURAS_SP01,
  },
  {
    id: 2,
    nome: "SP-02",
    dadosCabecalho: {
      cotaBoca: 15.2,
      profundidadeFinal: 8,
      criterio: "Solicitação do Contratante",
      nivelAgua: 2.8,
      coordX: 543245,
      coordY: 9876512,
    },
    leituras: LEITURAS_SP02,
  },
];

export default function Sondagens() {
  const [sondagens, setSondagens] = useState(SONDAGENS_INICIAIS);
  const [activeSondagemId, setActiveSondagemId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeNovaSondagem, setNomeNovaSondagem] = useState("");

  const sondagemAtiva = useMemo(
    () => sondagens.find((sondagem) => sondagem.id === activeSondagemId),
    [activeSondagemId, sondagens]
  );

  const dadosCabecalho = sondagemAtiva?.dadosCabecalho ?? criarCabecalhoVazio();
  const leituras = sondagemAtiva?.leituras ?? [];

  const atualizarSondagemAtiva = (transformar) => {
    setSondagens((atuais) =>
      atuais.map((sondagem) =>
        sondagem.id === activeSondagemId ? transformar(sondagem) : sondagem
      )
    );
  };

  const abrirModal = () => {
    setNomeNovaSondagem("");
    setIsModalOpen(true);
  };

  const fecharModal = () => setIsModalOpen(false);

  const handleCriarSondagem = (event) => {
    event.preventDefault();
    const nome = nomeNovaSondagem.trim();
    if (!nome) return;

    const novaSondagem = {
      id: Date.now(),
      nome,
      dadosCabecalho: criarCabecalhoVazio(),
      leituras: [],
    };

    setSondagens((atuais) => [...atuais, novaSondagem]);
    setActiveSondagemId(novaSondagem.id);
    fecharModal();
  };

  const handleCabecalhoChange = (event) => {
    const { name, value } = event.target;

    atualizarSondagemAtiva((sondagem) => {
      const novosDadosCabecalho = {
        ...sondagem.dadosCabecalho,
        [name]: value,
      };

      let novasLeituras = sondagem.leituras;

      if (name === "cotaBoca") {
        const novaCotaBoca = Number(value);
        if (Number.isFinite(novaCotaBoca)) {
          novasLeituras = sondagem.leituras.map((leitura) => ({
            ...leitura,
            cota: (novaCotaBoca - Number(leitura.profundidade || 0)).toFixed(2),
          }));
        }
      }

      return {
        ...sondagem,
        dadosCabecalho: novosDadosCabecalho,
        leituras: novasLeituras,
      };
    });
  };

  const handleLeituraChange = (id, field, value) => {
    atualizarSondagemAtiva((sondagem) => ({
      ...sondagem,
      leituras: sondagem.leituras.map((leitura) => {
        if (leitura.id !== id) return leitura;

        if (field === "solo") {
          return {
            ...leitura,
            solo: value,
            familia: obterFamiliaSolo(value),
          };
        }

        if (field === "profundidade") {
          const cotaBoca = Number(sondagem.dadosCabecalho.cotaBoca);
          const profundidade = Number(value);

          return {
            ...leitura,
            profundidade: value,
            cota:
              Number.isFinite(cotaBoca) && Number.isFinite(profundidade)
                ? (cotaBoca - profundidade).toFixed(2)
                : leitura.cota,
          };
        }

        return { ...leitura, [field]: value };
      }),
    }));
  };

  const adicionarLeitura = () => {
    atualizarSondagemAtiva((sondagem) => {
      const ultimaProfundidade = sondagem.leituras.length
        ? Math.max(
            ...sondagem.leituras.map(
              (leitura) => Number(leitura.profundidade) || 0
            )
          )
        : 0;
      const novaProfundidade = ultimaProfundidade + 1;
      const cotaBoca = Number(sondagem.dadosCabecalho.cotaBoca);

      const novaLeitura = {
        id: Date.now(),
        profundidade: novaProfundidade,
        cota: Number.isFinite(cotaBoca)
          ? (cotaBoca - novaProfundidade).toFixed(2)
          : "",
        nspt: "",
        solo: "",
        familia: "",
      };

      return {
        ...sondagem,
        leituras: [...sondagem.leituras, novaLeitura],
      };
    });
  };

  const duplicarLeitura = (idBase) => {
    atualizarSondagemAtiva((sondagem) => {
      const leituraBase = sondagem.leituras.find(
        (leitura) => leitura.id === idBase
      );
      if (!leituraBase) return sondagem;

      const ultimaProfundidade = sondagem.leituras.length
        ? Math.max(
            ...sondagem.leituras.map(
              (leitura) => Number(leitura.profundidade) || 0
            )
          )
        : 0;
      const novaProfundidade = ultimaProfundidade + 1;
      const cotaBoca = Number(sondagem.dadosCabecalho.cotaBoca);

      return {
        ...sondagem,
        leituras: [
          ...sondagem.leituras,
          {
            ...leituraBase,
            id: Date.now(),
            profundidade: novaProfundidade,
            cota: Number.isFinite(cotaBoca)
              ? (cotaBoca - novaProfundidade).toFixed(2)
              : "",
          },
        ],
      };
    });
  };

  const uniformizarAbaixo = (idBase) => {
    atualizarSondagemAtiva((sondagem) => {
      const indiceBase = sondagem.leituras.findIndex(
        (leitura) => leitura.id === idBase
      );

      if (indiceBase < 0 || indiceBase === sondagem.leituras.length - 1) {
        return sondagem;
      }

      const leituraBase = sondagem.leituras[indiceBase];

      return {
        ...sondagem,
        leituras: sondagem.leituras.map((leitura, indice) =>
          indice > indiceBase
            ? {
                ...leitura,
                nspt: leituraBase.nspt,
                solo: leituraBase.solo,
                familia: leituraBase.familia,
              }
            : leitura
        ),
      };
    });
  };

  const removerLeitura = (id) => {
    atualizarSondagemAtiva((sondagem) => ({
      ...sondagem,
      leituras: sondagem.leituras.filter((leitura) => leitura.id !== id),
    }));
  };

  return (
    <>
      <div className="mx-auto flex max-w-[1800px] flex-col gap-5">
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sondagens
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gerencie os furos, leituras NSPT e o perfil geotécnico da obra.
              </p>
            </div>
            <button
              onClick={abrirModal}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova Sondagem
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {sondagens.map((sondagem) => {
              const estaAtiva = activeSondagemId === sondagem.id;
              const totalLeituras = sondagem.leituras.length;
              const cotaExibida = sondagem.dadosCabecalho.cotaBoca;

              return (
              <button
                key={sondagem.id}
                onClick={() => setActiveSondagemId(sondagem.id)}
                className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                  estaAtiva
                    ? "border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-base font-bold text-slate-900">{sondagem.nome}</span>
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600">
                  <span>{totalLeituras} leituras</span>
                  <span>{cotaExibida === "-" || cotaExibida === "" ? "Sem cota" : `Boca ${cotaExibida} m`}</span>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Dados do furo
              </p>
              <h2 className="text-base font-bold text-slate-800">
                {sondagemAtiva?.nome ?? "Sondagem"}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <CampoCompacto label="Cota da boca (m)">
              <input
                type="number"
                step="0.01"
                name="cotaBoca"
                value={dadosCabecalho.cotaBoca}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </CampoCompacto>

            <CampoCompacto label="Prof. final (m)">
              <input
                type="number"
                step="0.01"
                name="profundidadeFinal"
                value={dadosCabecalho.profundidadeFinal}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </CampoCompacto>

            <CampoCompacto label="Nível d'água (m)">
              <input
                type="number"
                step="0.01"
                name="nivelAgua"
                value={dadosCabecalho.nivelAgua}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </CampoCompacto>

            <CampoCompacto label="Critério">
              <select
                name="criterio"
                value={dadosCabecalho.criterio}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="Impenetrável">Impenetrável</option>
                <option value="Solicitação do Contratante">Solicitação do contratante</option>
                <option value="Outro">Outro</option>
              </select>
            </CampoCompacto>

            <CampoCompacto label="Coordenada X">
              <input
                type="number"
                name="coordX"
                value={dadosCabecalho.coordX}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </CampoCompacto>

            <CampoCompacto label="Coordenada Y">
              <input
                type="number"
                name="coordY"
                value={dadosCabecalho.coordY}
                onChange={handleCabecalhoChange}
                className="h-9 w-full rounded-lg border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </CampoCompacto>
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Leituras NSPT</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  O perfil é atualizado em tempo real.
                </p>
              </div>
              <button
                onClick={adicionarLeitura}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </button>
            </div>

            <div className="max-h-[760px] overflow-x-auto overflow-y-auto sm:overflow-x-hidden">
              <table className="w-full min-w-[430px] table-fixed text-left text-xs text-slate-600 sm:min-w-0">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-[58px] px-1.5 py-2.5">Prof.</th>
                    <th className="w-[58px] px-1.5 py-2.5">Cota</th>
                    <th className="w-[52px] px-1.5 py-2.5">NSPT</th>
                    <th className="px-1.5 py-2.5">Solo / família</th>
                    <th className="w-[92px] px-1.5 py-2.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leituras.map((leitura, indiceLeitura) => {
                    const familia = obterConfigFamilia(leitura.familia);
                    const temLeiturasAbaixo = indiceLeitura < leituras.length - 1;

                    return (
                      <tr key={leitura.id} className="hover:bg-slate-50">
                        <td className="px-1.5 py-2 align-top">
                          <input
                            type="number"
                            step="0.01"
                            value={leitura.profundidade}
                            onChange={(event) =>
                              handleLeituraChange(leitura.id, "profundidade", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-300 px-1.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <input
                            type="number"
                            step="0.01"
                            value={leitura.cota}
                            onChange={(event) =>
                              handleLeituraChange(leitura.id, "cota", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-300 px-1.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <input
                            type="number"
                            min="0"
                            value={leitura.nspt}
                            onChange={(event) =>
                              handleLeituraChange(leitura.id, "nspt", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-300 px-1.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <select
                            value={leitura.solo}
                            onChange={(event) =>
                              handleLeituraChange(leitura.id, "solo", event.target.value)
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Selecione...</option>
                            {TIPOS_SOLO.map((tipoSolo) => (
                              <option key={tipoSolo.nome} value={tipoSolo.nome}>
                                {tipoSolo.nome}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${familia.classeBadge}`}
                          >
                            {familia.nome}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => duplicarLeitura(leitura.id)}
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                              title="Duplicar leitura"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => uniformizarAbaixo(leitura.id)}
                              disabled={!temLeiturasAbaixo}
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                              title={
                                temLeiturasAbaixo
                                  ? "Uniformizar abaixo: copiar NSPT e solo/família"
                                  : "Não há leituras abaixo"
                              }
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M7 8h10M12 12v8m0 0l-3-3m3 3l3-3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removerLeitura(leitura.id)}
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Remover leitura"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {leituras.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">
                        Nenhuma leitura cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <PerfilSondagem
            className="min-w-0 xl:sticky xl:top-4"
            nomeSondagem={sondagemAtiva?.nome}
            leituras={leituras}
            cotaBoca={dadosCabecalho.cotaBoca}
            profundidadeFinal={dadosCabecalho.profundidadeFinal}
            nivelAgua={dadosCabecalho.nivelAgua}
            criterio={dadosCabecalho.criterio}
            coordX={dadosCabecalho.coordX}
            coordY={dadosCabecalho.coordY}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">Criar nova sondagem!</h3>
              <p className="mt-1 text-sm text-slate-500">
                Insira o nome de identificação do novo furo.
              </p>
            </div>

            <form onSubmit={handleCriarSondagem}>
              <label htmlFor="nomeSondagem" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nome / ID do furo
              </label>
              <input
                type="text"
                id="nomeSondagem"
                value={nomeNovaSondagem}
                onChange={(event) => setNomeNovaSondagem(event.target.value)}
                placeholder="Ex.: SP-03"
                required
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Criar sondagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function CampoCompacto({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
