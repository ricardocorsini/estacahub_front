import { Calculator, ChevronDown, LoaderCircle, SlidersHorizontal } from "lucide-react";

import { formatarNumero, nomeTipoEstaca, numero } from "../../../utils/estacas";
import { cotaEmMetros, TRATAMENTOS_PONTA } from "../../../utils/cargaAdmissivel";

const OPCOES_BOOLEANAS = [
  ["desprezaUltimoMetroAtrito", "Desprezar o último metro de atrito"],
  ["aplicaRedutorPonta", "Aplicar redutor de ponta por tipo de estaca"],
  ["limitaPontaPorAtrito", "Limitar a resistência de ponta à do fuste"],
];

export default function ConfiguracaoCarga({
  dados, selecao, estaca, sondagem, opcoes, calculando, onSelecionar, onOpcao, onCalcular,
}) {
  const leituras = sondagem?.leituras.filter(({ nspt }) => numero(nspt) != null).length;

  return (
    <form className="carga-card carga-form" onSubmit={onCalcular} aria-label="Configuração do cálculo">
      <div className="carga-form-principal">
        <div className="carga-campo">
          <label htmlFor="carga-estaca">Estaca</label>
          <select
            id="carga-estaca"
            value={selecao.estaca}
            onChange={(event) => onSelecionar("estaca", event.target.value)}
            aria-describedby={estaca ? "carga-estaca-info" : undefined}
          >
            <option value="">Selecione a estaca</option>
            {dados.estacas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
          {estaca && (
            <small id="carga-estaca-info">
              {nomeTipoEstaca(estaca.tipo)} · Ø {formatarNumero(estaca.diametroCm, 1)} cm
              {" · Arrasamento "}{cotaEmMetros(numero(estaca.cotaArrasamento))}
            </small>
          )}
        </div>

        <div className="carga-campo">
          <label htmlFor="carga-sondagem">Sondagem SPT</label>
          <select
            id="carga-sondagem"
            value={selecao.sondagem}
            onChange={(event) => onSelecionar("sondagem", event.target.value)}
            aria-describedby={sondagem ? "carga-sondagem-info" : undefined}
          >
            <option value="">Selecione a sondagem</option>
            {dados.sondagens.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
          {sondagem && (
            <small id="carga-sondagem-info">
              Boca {cotaEmMetros(numero(sondagem.dadosCabecalho.cotaBoca))}
              {" · "}{leituras} {leituras === 1 ? "leitura" : "leituras"} com NSPT
            </small>
          )}
        </div>

        <button type="submit" className="carga-botao carga-botao-primario" disabled={!estaca || !sondagem || calculando}>
          {calculando
            ? <LoaderCircle size={17} className="workspace-spin" aria-hidden="true" />
            : <Calculator size={17} aria-hidden="true" />}
          {calculando ? "Calculando…" : "Calcular"}
        </button>
      </div>

      <details className="carga-ajustes">
        <summary>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Critérios de cálculo
          <ChevronDown size={16} className="carga-seta-ajustes" aria-hidden="true" />
        </summary>
        <div className="carga-opcoes">
          <div className="carga-campo">
            <label htmlFor="carga-tratamento">Tratamento da ponta</label>
            <select
              id="carga-tratamento"
              value={opcoes.tratamentoPonta}
              aria-describedby="carga-tratamento-ajuda"
              onChange={(event) => onOpcao("tratamentoPonta", event.target.value)}
            >
              {Object.entries(TRATAMENTOS_PONTA).map(([valor, nome]) =>
                <option key={valor} value={valor}>{nome}</option>,
              )}
            </select>
            <small id="carga-tratamento-ajuda">
              Com ressalva, a ponta fica limitada ao fuste. Sem contato, sua resistência é zero.
            </small>
          </div>
          <fieldset className="carga-checkboxes">
            <legend className="workspace-sr-only">Opções de ponta e fuste</legend>
            {OPCOES_BOOLEANAS.map(([chave, nome]) => (
              <label key={chave}>
                <input
                  type="checkbox"
                  checked={opcoes[chave]}
                  onChange={(event) => onOpcao(chave, event.target.checked)}
                />
                {nome}
              </label>
            ))}
          </fieldset>
        </div>
      </details>
    </form>
  );
}
