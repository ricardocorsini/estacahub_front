import {
  converterDeKn, CRITERIOS_GOVERNANTES, cotaEmMetros, METODOS_CARGA,
  textoCarga, TRATAMENTOS_PONTA,
} from "../../../utils/cargaAdmissivel";
import { formatarNumero } from "../../../utils/estacas";

const GRANDEZAS = [
  ["Resistência lateral · Rₗ", "resistenciaLateralKn"],
  ["Resistência de ponta bruta", "resistenciaPontaBrutaKn"],
  ["Resistência de ponta considerada · Rₚ", "resistenciaPontaKn"],
  ["Resistência de ruptura · Rₗ + Rₚ", "resistenciaRupturaKn"],
  ["Carga admissível · fator global", "cargaAdmissivelGlobalKn"],
  ["Carga admissível · fatores por parcelas", "cargaAdmissivelParcialKn"],
  ["Carga admissível geotécnica", "cargaAdmissivelGeotecnicaKn"],
  ["Carga admissível final", "cargaAdmissivelFinalKn"],
];

function QuadroResistencias({ ponto, valor }) {
  return (
    <div className="carga-tabela-rolagem" tabIndex={0} role="region" aria-label="Resistências e cargas admissíveis">
      <table className="carga-tabela carga-tabela-parcelas">
        <thead>
          <tr>
            <th scope="col">Parcela</th>
            {METODOS_CARGA.map(({ chave, nome }) => <th scope="col" key={chave}>{nome}</th>)}
          </tr>
        </thead>
        <tbody>
          {GRANDEZAS.map(([rotulo, campo]) => (
            <tr key={campo} className={campo === "cargaAdmissivelFinalKn" ? "carga-resistencia-final" : undefined}>
              <th scope="row">{rotulo}</th>
              {METODOS_CARGA.map(({ chave }) => (
                <td key={chave}>
                  {valor(ponto[chave][campo])}
                  {campo === "resistenciaPontaKn" && ponto[chave].pontaLimitadaPorAtrito && (
                    <small>Limitada pelo fuste</small>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row">Critério governante</th>
            {METODOS_CARGA.map(({ chave }) => (
              <td key={chave}>{CRITERIOS_GOVERNANTES[ponto[chave].criterioGovernante]}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PontaMemorial({ memorial }) {
  const dq = memorial.pontaDecourtQuaresma;
  const av = memorial.pontaAokiVelloso;
  const leituraRepetida = new Set(memorial.leiturasPonta.map((l) => l.leituraId)).size < memorial.leiturasPonta.length;
  return (
    <section aria-labelledby="carga-memorial-ponta" className="carga-memorial-bloco">
      <h3 id="carga-memorial-ponta">Resistência de ponta</h3>
      <dl className="carga-parametros-ponta">
        <div className="carga-metodo-dq">
          <dt>Décourt–Quaresma</dt>
          <dd>C {formatarNumero(dq.cKpa, 0)} kPa · α {formatarNumero(dq.alfa, 2)} · qₚ {formatarNumero(dq.tensaoKpa, 2)} kPa</dd>
        </div>
        <div className="carga-metodo-av">
          <dt>Aoki–Velloso</dt>
          <dd>K {formatarNumero(av.kKpa, 0)} kPa · F₁ {formatarNumero(av.f1, 3)} · qₚ {formatarNumero(av.tensaoKpa, 2)} kPa</dd>
        </div>
      </dl>
      <div className="carga-tabela-rolagem" tabIndex={0} role="region" aria-label="Leituras de NSPT usadas na ponta">
        <table className="carga-tabela carga-tabela-leituras">
          <thead>
            <tr>
              {["Cota na grade", "Cota da leitura", "Solo", "NSPT medido", "NSPT adotado"].map((rotulo) => (
                <th key={rotulo} scope="col">{rotulo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memorial.leiturasPonta.map((leitura) => (
              <tr key={leitura.cotaGradeM}>
                <th scope="row">{cotaEmMetros(leitura.cotaGradeM)}</th>
                <td>{cotaEmMetros(leitura.cotaLeituraM)}</td>
                <td>{leitura.solo}</td>
                <td>{leitura.nsptMedido}</td>
                <td>{leitura.nsptUsado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leituraRepetida && <p>Uma leitura equidistante de duas cotas representa ambas na grade.</p>}
    </section>
  );
}

function FusteMemorial({ memorial, valor }) {
  return (
    <section aria-labelledby="carga-memorial-fuste" className="carga-memorial-bloco">
      <h3 id="carga-memorial-fuste">Atrito lateral por camada</h3>
      {memorial.camadasAtrito.length === 0 ? (
        <p>Nenhuma camada do fuste tem leitura SPT para esta cota.</p>
      ) : (
        <div className="carga-tabela-rolagem" tabIndex={0} role="region" aria-label="Atrito das camadas do fuste">
          <table className="carga-tabela carga-tabela-fuste">
            <thead>
              <tr>
                {["Trecho da grade", "Solo", "NSPT medido", "Décourt–Quaresma", "Aoki–Velloso", "Uso no cálculo"].map((rotulo) => (
                  <th key={rotulo} scope="col">{rotulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memorial.camadasAtrito.map(({ amostra, cotaBaseM, desprezada, decourtQuaresma, aokiVelloso }) => (
                <tr key={amostra.cotaGradeM} data-desprezada={desprezada || undefined}>
                  <th scope="row">{cotaEmMetros(amostra.cotaGradeM)} → {cotaEmMetros(cotaBaseM)}</th>
                  <td>{amostra.solo}<small>Leitura em {cotaEmMetros(amostra.cotaLeituraM)}</small></td>
                  <td>{amostra.nsptMedido}</td>
                  <td>
                    <strong>{valor(decourtQuaresma.resistenciaKn)}</strong>
                    <small>NSPT {decourtQuaresma.nsptUsado} · β {formatarNumero(decourtQuaresma.beta, 2)}</small>
                    <small>fₗ {formatarNumero(decourtQuaresma.tensaoKpa, 2)} kPa</small>
                  </td>
                  <td>
                    <strong>{valor(aokiVelloso.resistenciaKn)}</strong>
                    <small>NSPT {aokiVelloso.nsptUsado} · α {formatarNumero(aokiVelloso.alfaPercentual, 2)}%</small>
                    <small>K {formatarNumero(aokiVelloso.kKpa, 0)} kPa · F₂ {formatarNumero(aokiVelloso.f2, 3)}</small>
                    <small>fₗ {formatarNumero(aokiVelloso.tensaoKpa, 2)} kPa</small>
                  </td>
                  <td>{desprezada ? "Último metro desprezado" : "Considerado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {memorial.trechosSemSpt.length > 0 && (
        <div className="carga-sem-spt">
          <strong>Trechos sem contribuição por falta de SPT</strong>
          <ul>
            {memorial.trechosSemSpt.map(({ cotaTopoM, cotaBaseM }) => (
              <li key={cotaTopoM}>{cotaEmMetros(cotaTopoM)} → {cotaEmMetros(cotaBaseM)}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function MemorialCarga({ resultado, ponto, unidade }) {
  const { memorial, opcoes } = resultado;
  const valor = (kn) => textoCarga(converterDeKn(kn, unidade, resultado.knPorTf), unidade);

  return (
    <div className="carga-memorial">
      <header>
        <h2>Memorial da cota {cotaEmMetros(memorial.cotaPontaM)}</h2>
        <p>{resultado.nomeEstaca} · {resultado.nomeSondagem} · {TRATAMENTOS_PONTA[opcoes.tratamentoPonta]}</p>
      </header>
      <dl className="carga-memorial-geometria">
        <div><dt>Arrasamento cadastrado</dt><dd>{cotaEmMetros(resultado.cotaArrasamentoM)}</dd></div>
        <div><dt>Arrasamento na grade</dt><dd>{cotaEmMetros(resultado.cotaArrasamentoGradeM)}</dd></div>
        <div><dt>Área da ponta</dt><dd>{formatarNumero(resultado.areaPontaM2, 4)} m²</dd></div>
        <div><dt>Perímetro</dt><dd>{formatarNumero(resultado.perimetroM, 4)} m</dd></div>
      </dl>
      <div className="carga-fatores">
        <span>FS global <strong>{formatarNumero(resultado.fsGlobal, 2)}</strong></span>
        {ponto.decourtQuaresma.cargaAdmissivelParcialKn != null && (
          <span>FS Décourt–Quaresma <strong>{formatarNumero(resultado.fsLateralDecourtQuaresma, 2)}</strong> no fuste e <strong>{formatarNumero(resultado.fsPontaDecourtQuaresma, 2)}</strong> na ponta</span>
        )}
        <span>Fator multiplicador da ponta <strong>{formatarNumero(resultado.fatorRedutorPonta, 2)}</strong></span>
      </div>
      <QuadroResistencias ponto={ponto} valor={valor} />
      <PontaMemorial memorial={memorial} />
      <FusteMemorial memorial={memorial} valor={valor} />
    </div>
  );
}
