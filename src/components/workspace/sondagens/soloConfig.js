export const FAMILIAS_SOLO = {
  Granular: {
    nome: "Granular",
    descricao: "Solo predominantemente arenoso",
    classeBadge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  Coesivo: {
    nome: "Coesivo",
    descricao: "Solo predominantemente argiloso",
    classeBadge: "border-rose-200 bg-rose-50 text-rose-800",
  },
  Intermediário: {
    nome: "Intermediário",
    descricao: "Solo predominantemente siltoso",
    classeBadge: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export const TIPOS_SOLO = [
  {
    nome: "Areia",
    familia: "Granular",
    cor: "#FDE68A",
    corLinha: "#A16207",
    hachura: "dots",
  },
  {
    nome: "Areia Siltosa",
    familia: "Granular",
    cor: "#FCD34D",
    corLinha: "#92400E",
    hachura: "diagonal",
  },
  {
    nome: "Areia Silto-argilosa",
    familia: "Granular",
    cor: "#FBBF24",
    corLinha: "#92400E",
    hachura: "cross",
  },
  {
    nome: "Areia Argilo-siltosa",
    familia: "Granular",
    cor: "#F59E0B",
    corLinha: "#78350F",
    hachura: "horizontalDense",
  },
  {
    nome: "Areia Argilosa",
    familia: "Granular",
    cor: "#D97706",
    corLinha: "#78350F",
    hachura: "diamonds",
  },
  {
    nome: "Argila",
    familia: "Coesivo",
    cor: "#FECACA",
    corLinha: "#991B1B",
    hachura: "horizontal",
  },
  {
    nome: "Argila Arenosa",
    familia: "Coesivo",
    cor: "#FDA4AF",
    corLinha: "#9F1239",
    hachura: "diagonalReverse",
  },
  {
    nome: "Argila Areno-siltosa",
    familia: "Coesivo",
    cor: "#FB7185",
    corLinha: "#881337",
    hachura: "grid",
  },
  {
    nome: "Argila Silto-arenosa",
    familia: "Coesivo",
    cor: "#F43F5E",
    corLinha: "#881337",
    hachura: "verticalDense",
  },
  {
    nome: "Argila Siltosa",
    familia: "Coesivo",
    cor: "#E11D48",
    corLinha: "#4C0519",
    hachura: "brick",
  },
  {
    nome: "Silte",
    familia: "Intermediário",
    cor: "#CBD5E1",
    corLinha: "#475569",
    hachura: "vertical",
  },
  {
    nome: "Silte Arenoso",
    familia: "Intermediário",
    cor: "#C7D2FE",
    corLinha: "#4338CA",
    hachura: "dotsLarge",
  },
  {
    nome: "Silte Areno-argiloso",
    familia: "Intermediário",
    cor: "#A5B4FC",
    corLinha: "#3730A3",
    hachura: "diagonalDense",
  },
  {
    nome: "Silte Argilo-arenoso",
    familia: "Intermediário",
    cor: "#94A3B8",
    corLinha: "#334155",
    hachura: "zigzag",
  },
  {
    nome: "Silte Argiloso",
    familia: "Intermediário",
    cor: "#64748B",
    corLinha: "#0F172A",
    hachura: "dash",
  },
];

export const obterConfigSolo = (tipoSolo) =>
  TIPOS_SOLO.find((solo) => solo.nome === tipoSolo) ?? null;

export const obterFamiliaSolo = (tipoSolo) =>
  obterConfigSolo(tipoSolo)?.familia ?? "";

export const obterConfigFamilia = (familia) =>
  FAMILIAS_SOLO[familia] ?? {
    nome: familia || "Não informado",
    descricao: "Família não informada",
    classeBadge: "border-slate-200 bg-slate-50 text-slate-600",
  };
