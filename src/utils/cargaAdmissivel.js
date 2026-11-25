import { formatarNumero } from "./estacas.js";

export const OPCOES_CARGA_PADRAO = {
  desprezaUltimoMetroAtrito: true,
  aplicaRedutorPonta: false,
  tratamentoPonta: "calculado",
  limitaPontaPorAtrito: false,
};

export const METODOS_CARGA = [
  { chave: "decourtQuaresma", nome: "Décourt–Quaresma", classe: "dq" },
  { chave: "aokiVelloso", nome: "Aoki–Velloso", classe: "av" },
];

export const TRATAMENTOS_PONTA = {
  calculado: "Resistência calculada",
  contato_com_ressalva: "Contato com ressalva",
  sem_contato: "Sem contato",
};

export const CRITERIOS_GOVERNANTES = {
  geotecnico_global: "Geotécnico · global",
  geotecnico_parcial: "Geotécnico · por parcelas",
  estrutural: "Estrutural",
};

const formatoCota = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 6 });

export function cotaEmMetros(valor) {
  return Number.isFinite(valor) ? `${formatoCota.format(valor)} m` : "—";
}

export function cargaFinal(metodo, unidade) {
  return unidade === "kN" ? metodo.cargaAdmissivelFinalKn : metodo.cargaAdmissivelFinalTf;
}

export function converterDeKn(valor, unidade, knPorTf) {
  if (valor == null) return null;
  return unidade === "kN" ? valor : valor / knPorTf;
}

export function textoCarga(valor, unidade) {
  return Number.isFinite(valor) ? `${formatarNumero(valor, 2)} ${unidade}` : "—";
}

export function cotaMaisAltaQueAtende(curva, cargaPrevistaTf) {
  if (!(cargaPrevistaTf > 0)) return null;
  // O backend ordena a curva da maior para a menor cota, sem interpolação.
  return curva.find((ponto) =>
    METODOS_CARGA.every(({ chave }) => ponto[chave].cargaAdmissivelFinalTf >= cargaPrevistaTf),
  )?.cotaPontaM ?? null;
}
