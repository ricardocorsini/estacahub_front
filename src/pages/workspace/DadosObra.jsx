import { useEffect, useRef, useState } from "react";

import { obrasService } from "../../services/obrasService";

const INITIAL_FORM_DATA = {
  nome: "",
  numero: "",
  localizacao: "",
  dataCadastro: "",
  sistemaCoordenadas: "local",
  responsavelTecnico: "",
  observacoes: "",
  foto: null,
  fotoPreview: "",
  legendaFoto: "",
};

function normalizeObraToForm(obra) {
  return {
    nome: obra?.nome || "",
    numero: obra?.numero || "",
    localizacao: obra?.localizacao || "",
    dataCadastro: obra?.dataCadastro || "",
    sistemaCoordenadas: obra?.sistemaCoordenadas || "local",
    responsavelTecnico: obra?.responsavelTecnico || "",
    observacoes: obra?.observacoes || "",
    foto: null,
    fotoPreview: "",
    legendaFoto: obra?.legendaFoto || "",
  };
}

function buildObraPayload(formData) {
  return {
    nome: formData.nome.trim(),
    numero: formData.numero.trim() || null,
    localizacao: formData.localizacao.trim() || null,
    dataCadastro: formData.dataCadastro || null,
    sistemaCoordenadas: formData.sistemaCoordenadas,
    responsavelTecnico: formData.responsavelTecnico.trim() || null,
    observacoes: formData.observacoes.trim() || null,
    legendaFoto: formData.legendaFoto.trim() || null,
  };
}

export default function DadosObra() {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [obras, setObras] = useState([]);
  const [selectedObraId, setSelectedObraId] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingObras, setIsLoadingObras] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = Boolean(selectedObraId);

  const selectedObra = obras.find((obra) => obra.id === selectedObraId);

  async function carregarObras() {
    try {
      setIsLoadingObras(true);
      setErrorMessage("");

      const data = await obrasService.listar();
      setObras(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Erro ao carregar obras.");
    } finally {
      setIsLoadingObras(false);
    }
  }

  useEffect(() => {
    carregarObras();
  }, []);

  useEffect(() => {
    return () => {
      if (formData.fotoPreview) {
        URL.revokeObjectURL(formData.fotoPreview);
      }
    };
  }, [formData.fotoPreview]);

  const clearMessages = () => {
    setFeedbackMessage("");
    setErrorMessage("");
  };

  const resetForm = () => {
    if (formData.fotoPreview) {
      URL.revokeObjectURL(formData.fotoPreview);
    }

    setFormData(INITIAL_FORM_DATA);
    setSelectedObraId(null);
    clearMessages();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectObra = (obra) => {
    if (formData.fotoPreview) {
      URL.revokeObjectURL(formData.fotoPreview);
    }

    setSelectedObraId(obra.id);
    setFormData(normalizeObraToForm(obra));
    clearMessages();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileProcess = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    if (formData.fotoPreview) {
      URL.revokeObjectURL(formData.fotoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      foto: file,
      fotoPreview: previewUrl,
      legendaFoto: "",
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!formData.nome.trim()) {
      setErrorMessage("Informe o nome da obra.");
      return;
    }

    const payload = buildObraPayload(formData);

    try {
      setIsSaving(true);

      let savedObra;

      if (isEditing) {
        savedObra = await obrasService.atualizar(selectedObraId, payload);
        setFeedbackMessage("Obra atualizada com sucesso.");
      } else {
        savedObra = await obrasService.criar(payload);
        setFeedbackMessage("Obra cadastrada com sucesso.");
      }

      await carregarObras();

      setSelectedObraId(savedObra.id);
      setFormData(normalizeObraToForm(savedObra));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(error.message || "Erro ao salvar obra.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedObraId) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja remover esta obra?"
    );

    if (!confirmar) return;

    try {
      setIsDeleting(true);
      clearMessages();

      await obrasService.remover(selectedObraId);

      resetForm();
      await carregarObras();

      setFeedbackMessage("Obra removida com sucesso.");
    } catch (error) {
      setErrorMessage(error.message || "Erro ao remover obra.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dados da Obra
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre, edite e consulte as informações principais da obra.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Nova obra
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Obras cadastradas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecione uma obra para carregar os dados no formulário.
            </p>
          </div>

          <button
            type="button"
            onClick={carregarObras}
            disabled={isLoadingObras}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingObras ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        <div className="mt-4">
          {isLoadingObras ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Carregando obras...
            </div>
          ) : obras.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Nenhuma obra cadastrada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {obras.map((obra) => {
                const active = obra.id === selectedObraId;

                return (
                  <button
                    key={obra.id}
                    type="button"
                    onClick={() => handleSelectObra(obra)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {obra.nome}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {obra.localizacao || "Localização não informada"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        #{obra.id}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {obra.numero && (
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          Nº {obra.numero}
                        </span>
                      )}

                      {obra.dataCadastro && (
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {obra.dataCadastro}
                        </span>
                      )}

                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {obra.sistemaCoordenadas === "utm"
                          ? "UTM"
                          : "Local"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {(feedbackMessage || errorMessage) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            errorMessage
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {errorMessage || feedbackMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? "Editar obra" : "Cadastrar nova obra"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? `Editando ${selectedObra?.nome || "obra selecionada"}.`
                : "Preencha os dados para cadastrar uma nova obra."}
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Removendo..." : "Remover obra"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="nome"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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
            <label
              htmlFor="numero"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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
            <label
              htmlFor="localizacao"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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
            <label
              htmlFor="dataCadastro"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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
            <label
              htmlFor="responsavelTecnico"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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

          <div className="md:col-span-2">
            <div className="mb-1.5 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Foto da Obra
              </label>

              <span className="text-xs text-slate-500">
                Neste momento, a imagem fica apenas no frontend.
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={onFileSelect}
            />

            {!formData.fotoPreview ? (
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
                  className={`mb-3 h-10 w-10 ${
                    isDragging ? "text-indigo-600" : "text-slate-400"
                  }`}
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
                  PNG, JPG ou WEBP
                </p>
              </div>
            ) : (
              <div className="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="group relative">
                  <img
                    src={formData.fotoPreview}
                    alt="Preview da Obra"
                    className="h-64 w-full object-cover transition-opacity group-hover:opacity-90"
                  />

                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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

                <div className="border-t border-slate-200 p-4">
                  <label
                    htmlFor="legendaFoto"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
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
            <label
              htmlFor="observacoes"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
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
            onClick={resetForm}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Salvar Dados"}
          </button>
        </div>
      </form>
    </div>
  );
}