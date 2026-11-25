import { Calculator, LoaderCircle } from "lucide-react";

import { formatarNumero, nomeTipoEstaca, numero } from "../../../utils/estacas";
import { cotaEmMetros } from "../../../utils/cargaAdmissivel";

import CriteriosCarga from "./CriteriosCarga";

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

      <CriteriosCarga opcoes={opcoes} onOpcao={onOpcao} />
    </form>
  );
}
