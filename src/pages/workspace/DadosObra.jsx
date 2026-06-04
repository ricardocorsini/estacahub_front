import { useState, useRef } from "react";

export default function DadosObra() {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    numero: "",
    localizacao: "",
    dataCadastro: "",
    sistemaCoordenadas: "local",
    responsavelTecnico: "",
    observacoes: "",
    foto: null,       // Arquivo físico
    fotoPreview: "",  // URL para exibição
    legendaFoto: "",
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Lógica de Upload de Imagem ---
  
  const handleFileProcess = (file) => {
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: previewUrl,
        legendaFoto: "", // Reseta a legenda ao trocar de foto
      }));
    } else {
      alert("Por favor, selecione um arquivo de imagem válido.");
    }
  };

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileProcess(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileProcess(file);
  };

  const removeFoto = () => {
    // Limpa a URL criada da memória para evitar vazamento
    if (formData.fotoPreview) {
      URL.revokeObjectURL(formData.fotoPreview);
    }
    setFormData((prev) => ({
      ...prev,
      foto: null,
      fotoPreview: "",
      legendaFoto: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados da Obra a serem enviados:", formData);
    // Para enviar arquivo (foto) ao backend, você provavelmente precisará usar FormData:
    // const payload = new FormData();
    // payload.append("nome", formData.nome);
    // ... e assim por diante
    // payload.append("foto", formData.foto);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dados da Obra
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre as informações principais e as configurações iniciais do projeto.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <div className="md:col-span-2">
            <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nome da Obra *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Edifício Comercial - Calhau"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="numero" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Número da Obra
            </label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Ex: 2026-001"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="localizacao" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Localização
            </label>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              value={formData.localizacao}
              onChange={handleChange}
              placeholder="Município/UF"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="dataCadastro" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Data de Cadastro
            </label>
            <input
              type="date"
              id="dataCadastro"
              name="dataCadastro"
              value={formData.dataCadastro}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="responsavelTecnico" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Responsável Técnico
            </label>
            <input
              type="text"
              id="responsavelTecnico"
              name="responsavelTecnico"
              value={formData.responsavelTecnico}
              onChange={handleChange}
              placeholder="Nome / CREA"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Sistema de Coordenadas
            </span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="sistemaCoordenadas"
                  value="local"
                  checked={formData.sistemaCoordenadas === "local"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                Local (x, y)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="sistemaCoordenadas"
                  value="utm"
                  checked={formData.sistemaCoordenadas === "utm"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                UTM (E, N)
              </label>
            </div>
          </div>

          {/* Seção de Upload de Foto */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Foto da Obra
            </label>
            
            {/* Input oculto */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileSelect}
            />

            {!formData.fotoPreview ? (
              // Estado Vazio: Área de Drag and Drop
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <svg
                  className={`mb-3 h-10 w-10 ${isDragging ? "text-indigo-600" : "text-slate-400"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-700">
                  Clique para carregar ou arraste uma imagem
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG ou WEBP (Max. 5MB)
                </p>
              </div>
            ) : (
              // Estado Preenchido: Preview e Legenda
              <div className="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="relative group">
                  <img
                    src={formData.fotoPreview}
                    alt="Preview da Obra"
                    className="h-64 w-full object-cover transition-opacity group-hover:opacity-90"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={removeFoto}
                      className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm hover:bg-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                
                {/* Campo de Legenda */}
                <div className="border-t border-slate-200 p-4">
                  <label htmlFor="legendaFoto" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Legenda da Imagem
                  </label>
                  <input
                    type="text"
                    id="legendaFoto"
                    name="legendaFoto"
                    value={formData.legendaFoto}
                    onChange={handleChange}
                    placeholder="Ex: Fachada principal após limpeza do terreno..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="observacoes" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Observações Gerais
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={4}
              placeholder="Detalhes adicionais sobre a obra..."
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Salvar Dados
          </button>
        </div>
      </form>
    </div>
  );
}