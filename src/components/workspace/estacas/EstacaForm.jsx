import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowDownToLine, Check, X } from "lucide-react";

import {
  TIPOS_ESTACA,
  alertasEstaca,
  cotaGradeSPT,
  formatarNumero,
  numero,
  referenciasEstaca,
} from "../../../utils/estacas";

const CAMPOS_NUMERICOS = [
  "coordX",
  "coordY",
  "diametroCm",
  "capacidadeEstruturalTf",
  "cotaArrasamento",
  "cargaPrevistaTf",
];

export default function EstacaForm({ estaca, onSalvar, onFechar }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(() => ({
    nome: estaca?.nome ?? "",
    coordX: estaca?.coordX ?? "",
    coordY: estaca?.coordY ?? "",
    tipo: estaca?.tipo ?? "helice_continua",
    diametroCm: estaca?.diametroCm ?? "",
    capacidadeEstruturalTf: estaca?.capacidadeEstruturalTf ?? "",
    cotaArrasamento: estaca?.cotaArrasamento ?? "",
    cargaPrevistaTf: estaca?.cargaPrevistaTf ?? "",
  }));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const refs = referenciasEstaca(form.tipo, form.diametroCm);
  const alertas = alertasEstaca(form);
  const capacidade = numero(form.capacidadeEstruturalTf);
  const avisosCapacidade = alertas.filter(
    (alerta) => alerta.codigo !== "carga",
  );
  const avisoCarga = alertas.find((alerta) => alerta.codigo === "carga");
  const temFaixaCatalogo =
    refs.catalogos.length > 1 ||
    refs.catalogos.some((item) => item.minKn !== item.maxKn);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  function mudar(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
    setErro("");
  }

  function usarValor(valor) {
    setForm((atual) => ({
      ...atual,
      capacidadeEstruturalTf: Number(valor.toFixed(6)),
    }));
  }

  async function enviar(event) {
    event.preventDefault();
    if (salvando) return;
    const payload = { ...form, nome: form.nome.trim() };
    if (!payload.nome) {
      setErro("Informe o nome da estaca.");
      return;
    }
    for (const campo of CAMPOS_NUMERICOS) {
      const valor = numero(form[campo]);
      if (valor == null) {
        setErro("Preencha todos os campos numéricos com valores válidos.");
        return;
      }
      if (Math.abs(valor * 1e6 - Math.round(valor * 1e6)) > 0.0001) {
        setErro("Use até seis casas decimais nos campos numéricos.");
        return;
      }
      payload[campo] = valor;
    }
    if (
      payload.diametroCm <= 0 ||
      payload.capacidadeEstruturalTf <= 0 ||
      payload.cargaPrevistaTf < 0
    ) {
      setErro(
        "Diâmetro e capacidade devem ser positivos. A carga prevista deve ser zero ou positiva.",
      );
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await onSalvar({ ...payload, ...(estaca?.id ? { id: estaca.id } : {}) });
    } catch (error) {
      setErro(error.message || "Não foi possível salvar a estaca.");
      setSalvando(false);
    }
  }

  function inputNumerico(campo, label, placeholder, opcoes = {}) {
    return (
      <div className="estacas-field">
        <label htmlFor={`estaca-${campo}`}>
          {label} <span aria-hidden="true">*</span>
        </label>
        <input
          id={`estaca-${campo}`}
          name={campo}
          type="number"
          inputMode="decimal"
          step="any"
          min={opcoes.min ?? -999999999}
          max={opcoes.max ?? 999999999}
          required
          value={form[campo]}
          placeholder={placeholder}
          onChange={mudar}
          aria-describedby={opcoes.descricao}
        />
      </div>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className="estacas-dialog"
      aria-labelledby="estaca-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!salvando) onFechar();
      }}
    >
      <form onSubmit={enviar} className="estacas-form">
        <header className="estacas-dialog-header">
          <div>
            <p className="estacas-eyebrow">CADASTRO DA OBRA</p>
            <h2 id="estaca-form-title">
              {estaca ? "Editar estaca" : "Nova estaca"}
            </h2>
            <p>Geometria, locação e parâmetros estruturais.</p>
          </div>
          <button
            type="button"
            className="estacas-icon-button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar formulário"
          >
            <X size={18} />
          </button>
        </header>

        <fieldset disabled={salvando} className="estacas-form-body">
          <p className="estacas-hint estacas-required">
            Campos com * são obrigatórios.
          </p>
          <div className="estacas-form-grid">
            <div className="estacas-field">
              <label htmlFor="estaca-nome">
                Nome <span aria-hidden="true">*</span>
              </label>
              <input
                autoFocus
                id="estaca-nome"
                name="nome"
                maxLength={100}
                required
                placeholder="E-01"
                value={form.nome}
                onChange={mudar}
              />
            </div>
            <div className="estacas-field">
              <label htmlFor="estaca-tipo">
                Tipo de estaca <span aria-hidden="true">*</span>
              </label>
              <select
                id="estaca-tipo"
                name="tipo"
                value={form.tipo}
                onChange={mudar}
              >
                {TIPOS_ESTACA.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            {inputNumerico("coordX", "X (m)", "0.00")}
            {inputNumerico("coordY", "Y (m)", "0.00")}

            <div className="estacas-field-wide">
              {inputNumerico("diametroCm", "Diâmetro (cm)", "ex.: 60", {
                min: 0.000001,
                max: 10000,
                descricao: "estaca-geometria",
              })}
              <div
                id="estaca-geometria"
                className="estacas-geometry"
                aria-live="polite"
              >
                <span>
                  Área{" "}
                  <strong>{formatarNumero(refs.geometria?.area, 4)} m²</strong>
                </span>
                <span>
                  Perímetro{" "}
                  <strong>
                    {formatarNumero(refs.geometria?.perimetro, 4)} m
                  </strong>
                </span>
              </div>
              {form.tipo === "pre_moldada_cravada" && (
                <p className="estacas-hint">
                  Área da seção circular cheia e perímetro externo. Para seção
                  vazada, a área de concreto depende da espessura da parede.
                </p>
              )}
              {form.tipo === "raiz" && (
                <p className="estacas-hint">
                  No catálogo, o diâmetro é o final da estaca, não o do tubo. A
                  faixa de carga depende da armadura utilizada.
                </p>
              )}
              {(refs.catalogos.length > 0 || refs.norma) && (
                <div className="estacas-references">
                  {refs.catalogos.map((item) => (
                    <div key={item.variante} className="estacas-reference-row">
                      <span>
                        Catálogo · {item.variante}
                        <small>{item.fonte}</small>
                      </span>
                      <strong>
                        {formatarNumero(item.minTf)}
                        {item.maxTf !== item.minTf
                          ? `–${formatarNumero(item.maxTf)}`
                          : ""}{" "}
                        tf
                      </strong>
                    </div>
                  ))}
                  {refs.norma && (
                    <div className="estacas-reference-row">
                      <span>
                        Norma · σ = {refs.norma.tensao} MPa × A
                        <small>
                          NBR 6122:2022 · Tabela 4 · critério de armadura
                        </small>
                      </span>
                      <strong>{formatarNumero(refs.norma.tf)} tf</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="estacas-field-wide">
              {inputNumerico(
                "capacidadeEstruturalTf",
                "Capacidade estrutural admissível (tf)",
                "ex.: 150",
                { min: 0.000001, descricao: "estaca-capacidade-ajuda" },
              )}
              <div id="estaca-capacidade-ajuda">
                {(refs.catalogoTf != null || refs.norma) && (
                  <div className="estacas-shortcuts">
                    {refs.catalogoTf != null && (
                      <button
                        type="button"
                        onClick={() => usarValor(refs.catalogoTf)}
                      >
                        <ArrowDownToLine size={13} /> Usar catálogo:{" "}
                        {formatarNumero(refs.catalogoTf)} tf
                      </button>
                    )}
                    {refs.norma && (
                      <button
                        type="button"
                        onClick={() => usarValor(refs.norma.tf)}
                      >
                        <ArrowDownToLine size={13} /> Usar norma:{" "}
                        {formatarNumero(refs.norma.tf)} tf
                      </button>
                    )}
                  </div>
                )}
                {temFaixaCatalogo && (
                  <p className="estacas-hint">
                    O atalho de catálogo usa o menor valor da faixa ou das
                    variantes. Confirme o modelo e a armadura antes de adotar
                    outra capacidade.
                  </p>
                )}
                {refs.norma && (
                  <p className="estacas-hint">
                    σ × A é uma referência para o critério de armadura da Tabela
                    4; a capacidade admissível exige dimensionamento estrutural.
                  </p>
                )}
                <div className="estacas-field-messages" aria-live="polite">
                  {avisosCapacidade.map((alerta) => (
                    <p className="estacas-inline-warning" key={alerta.codigo}>
                      <AlertTriangle size={15} />
                      <span>{alerta.texto}</span>
                    </p>
                  ))}
                  {capacidade > 0 &&
                    !avisosCapacidade.length &&
                    (refs.norma || refs.catalogoTf != null) && (
                      <p className="estacas-inline-success">
                        <Check size={15} />
                        <span>
                          Valor informado: {formatarNumero(capacidade)} tf (
                          {[
                            refs.norma &&
                              `norma: ${formatarNumero(refs.norma.tf)} tf`,
                            refs.catalogoTf != null &&
                              `catálogo: ${formatarNumero(refs.catalogoTf)} tf`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                          ).
                        </span>
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div>
              {inputNumerico(
                "cotaArrasamento",
                "Cota de arrasamento (m)",
                "ex.: 314.65",
                { descricao: "estaca-cota-ajuda" },
              )}
              <p id="estaca-cota-ajuda" className="estacas-hint">
                Pode ser decimal. O cálculo arredonda para baixo (grade SPT em
                metros).
              </p>
              {numero(form.cotaArrasamento) != null && (
                <p className="estacas-hint">
                  Referência na grade SPT:{" "}
                  <strong>
                    {formatarNumero(cotaGradeSPT(form.cotaArrasamento), 0)} m
                  </strong>
                  .
                </p>
              )}
            </div>
            <div>
              {inputNumerico(
                "cargaPrevistaTf",
                "Carga prevista (tf)",
                "ex.: 120",
                { min: 0, descricao: "estaca-carga-ajuda" },
              )}
              {avisoCarga && (
                <p id="estaca-carga-ajuda" className="estacas-inline-warning">
                  <AlertTriangle size={15} />
                  <span>{avisoCarga.texto}</span>
                </p>
              )}
            </div>
          </div>
          {erro && (
            <p className="estacas-notice estacas-notice-error" role="alert">
              {erro}
            </p>
          )}
        </fieldset>
        <footer className="estacas-dialog-footer">
          <button
            type="button"
            className="estacas-button"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="estacas-button estacas-button-primary"
            disabled={salvando}
          >
            {salvando
              ? "Salvando…"
              : estaca
                ? "Salvar alterações"
                : "Criar estaca"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
