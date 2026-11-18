import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ChartNoAxesCombined, LoaderCircle } from "lucide-react";

import ConfiguracaoCarga from "../../components/workspace/carga/ConfiguracaoCarga";
import ResultadosCarga from "../../components/workspace/carga/ResultadosCarga";
import { cargaAdmissivelService } from "../../services/cargaAdmissivelService";
import { estacasService } from "../../services/estacasService";
import { sondagensService } from "../../services/sondagensService";
import { OPCOES_CARGA_PADRAO } from "../../utils/cargaAdmissivel";
import "./CargaAdmissivel.css";

export default function CargaAdmissivel() {
  const { obraId } = useParams();
  return <CargaDaObra key={obraId} obraId={obraId} />;
}

function CargaDaObra({ obraId }) {
  const [cadastros, setCadastros] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [selecao, setSelecao] = useState({ estaca: "", sondagem: "" });
  const [opcoes, setOpcoes] = useState(OPCOES_CARGA_PADRAO);
  const [unidade, setUnidade] = useState("tf");
  const [calculo, setCalculo] = useState(null);
  const consulta = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      estacasService.listar(obraId, { signal }),
      sondagensService.listar(obraId, { signal }),
    ]).then(([estacas, sondagens]) => {
      if (signal.aborted) return;
      if (!Array.isArray(estacas) || !Array.isArray(sondagens)) {
        throw new Error("A API retornou cadastros em formato inesperado.");
      }
      setSelecao({
        estaca: estacas.length === 1 ? String(estacas[0].id) : "",
        sondagem: sondagens.length === 1 ? String(sondagens[0].id) : "",
      });
      setCadastros({ estacas, sondagens });
    }).catch((error) => {
      if (!signal.aborted) setCadastros({ erro: error.message });
    });
    return () => controller.abort();
  }, [obraId, tentativa]);

  useEffect(() => () => consulta.current?.abort(), []);

  const estaca = cadastros?.estacas?.find((item) => String(item.id) === selecao.estaca);
  const sondagem = cadastros?.sondagens?.find((item) => String(item.id) === selecao.sondagem);
  const calculando = calculo?.estado === "carregando";

  function limparCalculo() {
    consulta.current?.abort();
    consulta.current = null;
    setCalculo(null);
  }

  function selecionar(campo, valor) {
    limparCalculo();
    setSelecao((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function ajustar(campo, valor) {
    limparCalculo();
    setOpcoes((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  async function calcular(event) {
    event.preventDefault();
    if (!estaca || !sondagem || consulta.current) return;
    const controller = new AbortController();
    consulta.current = controller;
    setCalculo({ estado: "carregando" });
    try {
      const resultado = await cargaAdmissivelService.calcular(
        obraId, estaca.id, { sondagemId: sondagem.id, opcoes }, controller.signal,
      );
      if (!controller.signal.aborted) setCalculo({ estado: "pronto", resultado });
    } catch (error) {
      if (!controller.signal.aborted) setCalculo({ estado: "erro", error });
    } finally {
      if (consulta.current === controller) consulta.current = null;
    }
  }

  const podeConfigurar = cadastros?.estacas?.length > 0 && cadastros?.sondagens?.length > 0;

  return (
    <div className="carga-page">
      <header className="carga-page-header">
        <h1>Carga admissível</h1>
        {calculo?.resultado && (
          <div className="carga-unidades" role="group" aria-label="Unidade de carga">
            {["tf", "kN"].map((item) => (
              <button key={item} type="button" aria-pressed={unidade === item} onClick={() => setUnidade(item)}>
                {item}
              </button>
            ))}
          </div>
        )}
        <p>Compare a capacidade axial à compressão por cota de ponta.</p>
      </header>

      {!cadastros ? (
        <div className="carga-card carga-estado" role="status">
          <LoaderCircle size={21} className="workspace-spin" aria-hidden="true" /> Carregando estacas e sondagens…
        </div>
      ) : cadastros.erro ? (
        <section className="carga-card carga-estado">
          <p role="alert">Não foi possível carregar os cadastros. {cadastros.erro}</p>
          <button type="button" className="carga-botao" onClick={() => {
            setCadastros(null);
            setTentativa((valor) => valor + 1);
          }}>
            Tentar novamente
          </button>
        </section>
      ) : !podeConfigurar ? (
        <section className="carga-card carga-estado">
          <h2>Complete os cadastros da obra</h2>
          <p>O cálculo requer uma estaca e uma sondagem com leituras SPT.</p>
          <div className="carga-estado-links">
            {cadastros.estacas.length === 0 &&
              <Link className="carga-botao" to={`/obras/${obraId}/cadastro-estacas`}>Cadastrar estaca</Link>}
            {cadastros.sondagens.length === 0 &&
              <Link className="carga-botao" to={`/obras/${obraId}/sondagens`}>Cadastrar sondagem</Link>}
          </div>
        </section>
      ) : (
        <>
          <ConfiguracaoCarga
            dados={cadastros} selecao={selecao} estaca={estaca} sondagem={sondagem}
            opcoes={opcoes} calculando={calculando} onSelecionar={selecionar}
            onOpcao={ajustar} onCalcular={calcular}
          />
          {calculo?.estado === "erro" ? (
            <div className="carga-aviso carga-aviso-erro" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <div>
                <strong>Não foi possível calcular</strong>
                <p>{calculo.error.message}</p>
                {calculo.error.status === 422 && calculo.error.codigo && (
                  <Link to={`/obras/${obraId}/sondagens`}>Revisar dados da sondagem</Link>
                )}
              </div>
            </div>
          ) : calculo?.resultado ? (
            <ResultadosCarga respostaInicial={calculo.resultado} unidade={unidade} />
          ) : (
            <section className="carga-card carga-estado carga-estado-curva" role="status">
              {calculando ? <LoaderCircle size={25} className="workspace-spin" aria-hidden="true" />
                : <ChartNoAxesCombined size={25} aria-hidden="true" />}
              <h2>{calculando ? "Calculando as curvas" : "Curvas de carga admissível"}</h2>
              <p>{calculando ? "Usando o perfil SPT da sondagem selecionada."
                : "Selecione a estaca e a sondagem e clique em Calcular."}</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
