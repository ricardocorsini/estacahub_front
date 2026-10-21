// Referências transcritas das imagens fornecidas. Cargas originais em kN.
// Catálogos são consultas exatas: não interpolar diâmetros nem extrapolar faixas.
export const KN_POR_TF = 9.80665;

export const TIPOS_ESTACA = [
  { value: "helice_continua", label: "Hélice Contínua" },
  { value: "escavada_seco", label: "Escavada (a seco)" },
  { value: "escavada_fluido", label: "Escavada (com fluido bentonítico)" },
  { value: "pre_moldada_cravada", label: "Pré-moldada cravada" },
  { value: "raiz", label: "Raiz" },
];

const CATALOGOS = {
  helice_continua: [
    {
      variante: "Hélice contínua",
      fonte: "Tab. 2.6 · Antunes e Tarozzo (1998)",
      valores: [
        [27.5, 350],
        [30, 450],
        [35, 600],
        [40, 800],
        [42.5, 900],
        [50, 1250],
        [60, 1800],
        [70, 2450],
        [80, 3200],
        [90, 4000],
        [100, 5000],
      ],
    },
  ],
  escavada_seco: [
    {
      variante: "Trado helicoidal a seco",
      fonte: "Tab. 2.5 · Falconi et al. (1998)",
      valores: [
        [25, 250],
        [30, 360],
        [35, 490],
        [40, 640],
        [45, 810],
        [50, 1000],
      ],
    },
  ],
  escavada_fluido: [
    {
      variante: "Escavada com lama bentonítica",
      fonte: "Tab. 2.5 · Saes (1998)",
      valores: [
        [60, 1100],
        [70, 1500],
        [80, 2000],
        [100, 3100],
        [120, 4500],
        [140, 6200],
        [150, 7100],
        [160, 8200],
        [180, 10100],
        [200, 12500],
      ],
    },
  ],
  pre_moldada_cravada: [
    {
      variante: "Vibrada circular",
      fonte: "Tab. 2.2 · Alonso / Velloso e Lopes",
      valores: [
        [22, 400],
        [29, 600],
        [33, 800],
      ],
    },
    {
      variante: "Protendida circular",
      fonte: "Tab. 2.2 · Alonso / Velloso e Lopes",
      valores: [
        [20, 350],
        [25, 600],
        [33, 900],
      ],
    },
    {
      variante: "Centrifugada, seção vazada",
      fonte: "Tab. 2.2 · Alonso / Velloso e Lopes",
      valores: [
        [20, 300],
        [23, 400],
        [26, 500],
        [33, 750],
        [38, 900],
        [42, 1150],
        [50, 1700],
        [60, 2300],
        [70, 3000],
      ],
    },
  ],
  raiz: [
    {
      variante: "Raiz (depende da armadura)",
      fonte: "Tab. 2.6 · Alonso (1998)",
      valores: [
        [10, 100, 150],
        [12, 100, 250],
        [15, 100, 350],
        [16, 100, 450],
        [20, 100, 600],
        [25, 250, 800],
        [31, 300, 1100],
        [41, 500, 1500],
      ],
    },
  ],
};

// Tabela 4 da NBR 6122:2022 enviada: limiar de compressão para o critério
// de armadura. Não representa por si só a capacidade estrutural admissível.
const TENSAO_REFERENCIA_MPA = {
  helice_continua: 6,
  escavada_seco: 5,
  escavada_fluido: 6,
};

export function numero(valor) {
  if (
    valor == null ||
    typeof valor === "boolean" ||
    String(valor).trim() === ""
  )
    return null;
  const convertido = Number(String(valor).trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : null;
}

export function formatarNumero(valor, casas = 1) {
  const n = numero(valor);
  return n == null
    ? "—"
    : n.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      });
}

export function nomeTipoEstaca(tipo) {
  return TIPOS_ESTACA.find((item) => item.value === tipo)?.label || tipo;
}

export function geometriaEstaca(diametroCm) {
  const diametro = numero(diametroCm);
  if (diametro == null || diametro <= 0) return null;
  const d = diametro / 100;
  return { area: (Math.PI * d * d) / 4, perimetro: Math.PI * d };
}

export function referenciasEstaca(tipo, diametroCm) {
  const d = numero(diametroCm);
  const geometria = geometriaEstaca(d);
  const catalogos = (CATALOGOS[tipo] || []).flatMap((catalogo) => {
    const linha = catalogo.valores.find(([diametro]) => diametro === d);
    if (!linha) return [];
    return [
      {
        variante: catalogo.variante,
        fonte: catalogo.fonte,
        minKn: linha[1],
        maxKn: linha[2] ?? linha[1],
        minTf: linha[1] / KN_POR_TF,
        maxTf: (linha[2] ?? linha[1]) / KN_POR_TF,
      },
    ];
  });
  const tensao = TENSAO_REFERENCIA_MPA[tipo];
  const norma =
    geometria && tensao
      ? {
          tensao,
          tf: (tensao * 1000 * geometria.area) / KN_POR_TF,
        }
      : null;
  // Faixas e variantes não podem ser tratadas como uma capacidade única.
  // O atalho usa o menor valor e o formulário explica essa escolha.
  const catalogoTf = catalogos.length
    ? Math.min(...catalogos.map((item) => item.minTf))
    : null;
  return { geometria, catalogos, catalogoTf, norma };
}

export function alertasEstaca(estaca) {
  const capacidade = numero(estaca.capacidadeEstruturalTf);
  const carga = numero(estaca.cargaPrevistaTf);
  const { catalogoTf, catalogos, norma } = referenciasEstaca(
    estaca.tipo,
    estaca.diametroCm,
  );
  const alertas = [];
  // Tolerância apenas para arredondamento numérico, sem usar o valor exibido.
  if (capacidade != null && norma && capacidade > norma.tf + 0.000001) {
    alertas.push({
      codigo: "norma",
      texto:
        `Valor informado (${formatarNumero(capacidade)} tf) acima da referência da norma σ × A ` +
        `(${formatarNumero(norma.tf)} tf). O cadastro usa o valor informado; verifique o critério ` +
        "de armadura e o dimensionamento estrutural.",
    });
  }
  if (
    capacidade != null &&
    catalogoTf != null &&
    capacidade > catalogoTf + 0.000001
  ) {
    const faixa =
      catalogos.length > 1 ||
      catalogos.some((item) => item.minTf !== item.maxTf);
    alertas.push({
      codigo: "catalogo",
      texto:
        `Valor informado (${formatarNumero(capacidade)} tf) acima ${faixa ? "da menor referência" : "do catálogo"} ` +
        `(${formatarNumero(catalogoTf)} tf). ` +
        (faixa
          ? "Confira a variante e a armadura aplicáveis. "
          : "Verifique o dimensionamento estrutural. ") +
        "O cadastro usa o valor informado.",
    });
  }
  if (capacidade != null && carga != null && carga > capacidade + 0.000001) {
    alertas.push({
      codigo: "carga",
      texto:
        `Carga prevista (${formatarNumero(carga)} tf) acima da capacidade estrutural informada ` +
        `(${formatarNumero(capacidade)} tf). Verifique o dimensionamento.`,
    });
  }
  return alertas;
}

export function cotaGradeSPT(valor) {
  const cota = numero(valor);
  return cota == null ? null : Math.floor(cota);
}
