import { useState } from "react";

export default function Sondagens() {
  // Mock da lista de sondagens (Setor Superior)
  const [sondagensLista, setSondagensLista] = useState([
    { id: 1, nome: "SP-01", leituras: 3, cota: 15.5 },
    { id: 2, nome: "SP-02", leituras: 8, cota: 15.2 },
  ]);

  const [activeSondagemId, setActiveSondagemId] = useState(1);

  // Estados para o Modal de Nova Sondagem
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeNovaSondagem, setNomeNovaSondagem] = useState("");

  // Estado do Cabeçalho da Sondagem em edição
  const [dadosCabecalho, setDadosCabecalho] = useState({
    cotaBoca: 15.5,
    profundidadeFinal: 12.0,
    criterio: "Impenetrável",
    nivelAgua: 3.5,
    coordX: 543210,
    coordY: 9876540,
  });

  // Estado das Leituras (Tabela)
  const [leituras, setLeituras] = useState([
    { id: 1, profundidade: 1, cota: 14.5, nspt: 5, solo: "Argila", familia: "" },
    { id: 2, profundidade: 2, cota: 13.5, nspt: 8, solo: "Argila Silto-arenosa", familia: "" },
    { id: 3, profundidade: 3, cota: 12.5, nspt: 15, solo: "Areia Fina", familia: "" },
  ]);

  // --- Handlers do Modal ---
  const abrirModal = () => {
    setNomeNovaSondagem(""); 
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const handleCriarSondagem = (e) => {
    e.preventDefault();
    if (!nomeNovaSondagem.trim()) return;

    const novaSondagem = {
      id: Date.now(),
      nome: nomeNovaSondagem,
      leituras: 0,
      cota: "-", 
    };

    setSondagensLista([...sondagensLista, novaSondagem]);
    setActiveSondagemId(novaSondagem.id);

    setDadosCabecalho({
      cotaBoca: "",
      profundidadeFinal: "",
      criterio: "",
      nivelAgua: "",
      coordX: "",
      coordY: "",
    });
    
    setLeituras([]);
    fecharModal();
  };

  // --- Handlers de Edição ---
  const handleCabecalhoChange = (e) => {
    const { name, value } = e.target;
    setDadosCabecalho((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeituraChange = (id, field, value) => {
    setLeituras((prev) =>
      prev.map((leitura) =>
        leitura.id === id ? { ...leitura, [field]: value } : leitura
      )
    );
  };

  const adicionarLeitura = () => {
    const novaProfundidade = leituras.length > 0 
      ? Number(leituras[leituras.length - 1].profundidade) + 1 
      : 1;
      
    const cotaBase = dadosCabecalho.cotaBoca ? Number(dadosCabecalho.cotaBoca) : 0;
    const cotaCalculada = cotaBase ? (cotaBase - novaProfundidade).toFixed(2) : "";

    const novaLeitura = {
      id: Date.now(),
      profundidade: novaProfundidade,
      cota: cotaCalculada,
      nspt: "",
      solo: "",
      familia: "",
    };
    setLeituras([...leituras, novaLeitura]);
  };

  // Nova função para duplicar a leitura
  const duplicarLeitura = (idBase) => {
    const leituraBase = leituras.find(l => l.id === idBase);
    if (!leituraBase) return;

    const novaProfundidade = leituras.length > 0 
      ? Number(leituras[leituras.length - 1].profundidade) + 1 
      : 1;
      
    const cotaBase = dadosCabecalho.cotaBoca ? Number(dadosCabecalho.cotaBoca) : 0;
    const cotaCalculada = cotaBase ? (cotaBase - novaProfundidade).toFixed(2) : "";

    const novaLeitura = {
      id: Date.now(),
      profundidade: novaProfundidade,
      cota: cotaCalculada,
      nspt: leituraBase.nspt, // Copia o NSPT
      solo: leituraBase.solo, // Copia o Solo
      familia: leituraBase.familia, // Copia a Família
    };
    
    setLeituras([...leituras, novaLeitura]);
  };

  const removerLeitura = (id) => {
    setLeituras((prev) => prev.filter((leitura) => leitura.id !== id));
  };

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        
        {/* =========================================================================
            SETOR 1: Lista de Sondagens (Superior)
            ========================================================================= */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sondagens
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gerencie os furos de sondagem, perfis SPT e dados geotécnicos da obra.
              </p>
            </div>
            <button 
              onClick={abrirModal}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova Sondagem
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sondagensLista.map((sondagem) => (
              <button
                key={sondagem.id}
                onClick={() => setActiveSondagemId(sondagem.id)}
                className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                  activeSondagemId === sondagem.id
                    ? "border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg font-bold text-slate-900">{sondagem.nome}</span>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Leituras: <strong className="font-medium">{sondagem.leituras}</strong></span>
                  <span>Boca: <strong className="font-medium">{sondagem.cota === "-" ? "-" : `${sondagem.cota}m`}</strong></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Linha Inferior: Formulário/Tabela (Esquerda) e Gráfico (Direita) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* =========================================================================
              SETOR 2: Edição e Tabela de Leituras (Esquerda)
              ========================================================================= */}
          <div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-3">
            
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-800">
                Dados do Furo: {sondagensLista.find(s => s.id === activeSondagemId)?.nome}
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cota de Boca (m)</label>
                  <input
                    type="number"
                    name="cotaBoca"
                    value={dadosCabecalho.cotaBoca}
                    onChange={handleCabecalhoChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Prof. Final (m)</label>
                  <input
                    type="number"
                    name="profundidadeFinal"
                    value={dadosCabecalho.profundidadeFinal}
                    onChange={handleCabecalhoChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Critério de Paralisação</label>
                  <select
                    name="criterio"
                    value={dadosCabecalho.criterio}
                    onChange={handleCabecalhoChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="Impenetrável">Impenetrável</option>
                    <option value="Solicitação do Contratante">Solicitação do Contratante</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nível D'água - NA (m)</label>
                  <input
                    type="number"
                    name="nivelAgua"
                    value={dadosCabecalho.nivelAgua}
                    onChange={handleCabecalhoChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 xl:col-span-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Coord X</label>
                    <input
                      type="number"
                      name="coordX"
                      value={dadosCabecalho.coordX}
                      onChange={handleCabecalhoChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Coord Y</label>
                    <input
                      type="number"
                      name="coordY"
                      value={dadosCabecalho.coordY}
                      onChange={handleCabecalhoChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Leituras */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Leituras NSPT</h3>
                <button
                  onClick={adicionarLeitura}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Leitura
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Prof. (m)</th>
                      <th className="px-4 py-3">Cota (m)</th>
                      <th className="px-4 py-3">NSPT</th>
                      <th className="w-48 px-4 py-3">Solo</th>
                      <th className="px-4 py-3">Família</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leituras.map((leitura) => (
                      <tr key={leitura.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={leitura.profundidade}
                            onChange={(e) => handleLeituraChange(leitura.id, "profundidade", e.target.value)}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={leitura.cota}
                            onChange={(e) => handleLeituraChange(leitura.id, "cota", e.target.value)}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={leitura.nspt}
                            onChange={(e) => handleLeituraChange(leitura.id, "nspt", e.target.value)}
                            className="w-16 rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={leitura.solo}
                            onChange={(e) => handleLeituraChange(leitura.id, "solo", e.target.value)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">Selecione...</option>
                            <option value="Areia Fina">Areia Fina</option>
                            <option value="Areia Grossa">Areia Grossa</option>
                            <option value="Argila">Argila</option>
                            <option value="Argila Silto-arenosa">Argila Silto-arenosa</option>
                            <option value="Silte">Silte</option>
                            <option value="Rocha">Rocha</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={leitura.familia}
                            onChange={(e) => handleLeituraChange(leitura.id, "familia", e.target.value)}
                            placeholder="-"
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => duplicarLeitura(leitura.id)}
                              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                              title="Duplicar leitura"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removerLeitura(leitura.id)}
                              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Remover leitura"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leituras.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma leitura cadastrada. Clique em "Adicionar Leitura" para iniciar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SETOR 3: Gráfico (Direita)
              ========================================================================= */}
          <div className="flex min-h-[500px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-base font-bold text-slate-800">
              Perfil Geotécnico
            </h2>
            
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Visualização em breve
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                O gráfico interativo de NSPT por profundidade e as hachuras das camadas de solo serão renderizados nesta área.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MODAL: Nova Sondagem
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="mb-5">
              <h3 className="text-lg font-bold leading-6 text-slate-900">
                Criar Nova Sondagem
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Insira o nome de identificação do novo furo.
              </p>
            </div>

            <form onSubmit={handleCriarSondagem}>
              <div className="mb-6">
                <label htmlFor="nomeSondagem" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nome / ID do Furo *
                </label>
                <input
                  type="text"
                  id="nomeSondagem"
                  value={nomeNovaSondagem}
                  onChange={(e) => setNomeNovaSondagem(e.target.value)}
                  placeholder="Ex: SP-03"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Criar Sondagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}