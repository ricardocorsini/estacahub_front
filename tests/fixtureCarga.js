import { estacas, sondagens } from "./fixture.js";

const KN_POR_TF = 9.80665;

function metodo(tf, criterioGovernante, parcial = null) {
  const finalKn = tf * KN_POR_TF;
  return {
    resistenciaLateralKn: 102,
    resistenciaPontaBrutaKn: 180,
    resistenciaPontaKn: 160,
    resistenciaRupturaKn: 262,
    cargaAdmissivelGlobalKn: 131,
    cargaAdmissivelParcialKn: parcial,
    cargaAdmissivelGeotecnicaKn: finalKn,
    cargaAdmissivelFinalKn: finalKn,
    cargaAdmissivelFinalTf: tf,
    criterioGovernante,
    pontaLimitadaPorAtrito: false,
  };
}

export function resultado({ sondagemId, cotaPontaM, opcoes }) {
  const amostra = {
    leituraId: 101, cotaGradeM: 1, cotaLeituraM: 1.495, nsptMedido: 65, solo: "Argila siltosa",
  };
  const curva = [
    { cotaPontaM: 1, decourtQuaresma: metodo(60, "geotecnico_parcial", 95), aokiVelloso: metodo(65, "geotecnico_global") },
    { cotaPontaM: 0, decourtQuaresma: metodo(75, "geotecnico_parcial", 110), aokiVelloso: metodo(80, "estrutural") },
    { cotaPontaM: -2, decourtQuaresma: metodo(80, "estrutural", 200), aokiVelloso: metodo(80, "estrutural") },
  ].map((ponto) => ({
    comprimentoNaGradeM: 2 - ponto.cotaPontaM, nsptPonta: 23, quantidadeLeiturasPonta: 2,
    comprimentoFusteSemSptM: 1, ...ponto,
  }));
  const memorial = cotaPontaM == null ? null : {
    cotaPontaM,
    leiturasPonta: [{ ...amostra, nsptUsado: 50 }],
    camadasAtrito: [{
      amostra, cotaBaseM: 0, desprezada: true,
      decourtQuaresma: { nsptUsado: 50, beta: 1, tensaoKpa: 19, resistenciaKn: 23 },
      aokiVelloso: { nsptUsado: 50, kKpa: 220, alfaPercentual: 4, f2: 4, tensaoKpa: 110, resistenciaKn: 138 },
    }],
    trechosSemSpt: [{ cotaTopoM: 2, cotaBaseM: 1 }],
    pontaDecourtQuaresma: { cKpa: 120, alfa: 0.85, tensaoKpa: 2346 },
    pontaAokiVelloso: { kKpa: 220, f1: 2, tensaoKpa: 2530 },
  };
  return {
    obraId: 1, estacaId: 11, nomeEstaca: estacas[0].nome, sondagemId, nomeSondagem: sondagens[0].nome,
    cotaArrasamentoM: 2.345678, cotaArrasamentoGradeM: 2, areaPontaM2: 0.12566, perimetroM: 1.2566,
    capacidadeEstruturalTf: 80, capacidadeEstruturalKn: 80 * KN_POR_TF,
    cargaPrevistaTf: 70, knPorTf: KN_POR_TF, fsGlobal: 2,
    fsLateralDecourtQuaresma: 1.3, fsPontaDecourtQuaresma: 4, fatorRedutorPonta: 0.5,
    opcoes, avisos: ["verificar_contato_ponta"], curva, memorial,
  };
}
