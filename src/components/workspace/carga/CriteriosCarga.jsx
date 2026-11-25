import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { TRATAMENTOS_PONTA } from "../../../utils/cargaAdmissivel";

const OPCOES_BOOLEANAS = [
  ["desprezaUltimoMetroAtrito", "Desprezar o último metro de atrito"],
  ["aplicaRedutorPonta", "Aplicar redutor de ponta por tipo de estaca"],
  ["limitaPontaPorAtrito", "Limitar a resistência de ponta à do fuste"],
];

export default function CriteriosCarga({ opcoes, onOpcao }) {
  return (
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
  );
}
