// Dados EXCLUSIVOS de teste. Não são importados pelo aplicativo.
export const obra = {
  id: 1,
  nome: "Edifício São João · Locação técnica",
  numero: "OB/2026-01",
  localizacao: "Fortaleza / CE",
  dataCadastro: "2026-10-01",
  sistemaCoordenadas: "local",
  responsavelTecnico: "Eng. Ricardo",
  observacoes:
    "Observação com acentuação, zero 0 e negativo -3.\nTexto literal: \\P {teste} %%d; não deve aplicar formatação.",
  legendaFoto: "Vista cadastrada da obra",
  criadoEm: "2026-10-01T12:00:00Z",
  atualizadoEm: "2026-10-20T14:30:00Z",
};
export const estacas = [
  {
    id: 11,
    obraId: 1,
    nome: "E-01 / Fundação de teste",
    coordX: 0,
    coordY: 0,
    tipo: "helice_continua",
    diametroCm: 40,
    capacidadeEstruturalTf: 80,
    cotaArrasamento: 0,
    cargaPrevistaTf: 0,
    criadoEm: "2026-10-01T12:00:00Z",
    atualizadoEm: "2026-10-20T14:30:00Z",
  },
  {
    id: 12,
    obraId: 1,
    nome: "E-02 / Nome comprido para testar integridade cadastral e acentuação",
    coordX: 3,
    coordY: 4,
    tipo: "raiz",
    diametroCm: 40,
    capacidadeEstruturalTf: 50,
    cotaArrasamento: -2.123456,
    cargaPrevistaTf: 25,
  },
];
export const sondagens = [
  {
    id: 21,
    nome: "SP-01 · Sondagem coincidente",
    dadosCabecalho: {
      coordX: 0,
      coordY: 0,
      cotaBoca: 0,
      profundidadeFinal: 5,
      criterio: "Critério cadastrado",
      nivelAgua: 0,
    },
    leituras: [
      {
        id: 100,
        profundidade: 0,
        cota: 0,
        nspt: 0,
        solo: "Areia fina",
        familia: "areia",
      },
      {
        id: 101,
        profundidade: 1,
        cota: -1,
        nspt: 5,
        solo: "Argila siltosa",
        familia: "argila",
      },
    ],
  },
  {
    id: 22,
    nome: "SP-02 · Sem coordenada Y",
    dadosCabecalho: {
      coordX: -5.123456,
      coordY: null,
      cotaBoca: null,
      profundidadeFinal: null,
      criterio: null,
      nivelAgua: null,
    },
    leituras: [],
  },
];
export function fixtureAmpla() {
  const es = Array.from({ length: 30 }, (_, i) => ({
    ...estacas[0],
    id: 100 + i,
    nome: "E-" + String(i + 1).padStart(2, "0"),
    coordX: (i % 6) * 4 - 8,
    coordY: Math.floor(i / 6) * 4 - 4,
    diametroCm: [40, 50, 60][i % 3],
  }));
  const ss = [
    ...sondagens,
    {
      ...sondagens[0],
      id: 23,
      nome: "SP-03",
      dadosCabecalho: {
        ...sondagens[0].dadosCabecalho,
        coordX: 14,
        coordY: 14,
      },
    },
    {
      ...sondagens[0],
      id: 24,
      nome: "SP-04",
      dadosCabecalho: {
        ...sondagens[0].dadosCabecalho,
        coordX: -10,
        coordY: 10,
      },
    },
  ];
  return { obra, estacas: es, sondagens: ss };
}
