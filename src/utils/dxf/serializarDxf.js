import { DxfWriter, Units, point3d } from "@tarikjabiri/dxf";
import { LAYERS } from "./layoutLocacao.js";
import { escaparMText } from "./texto.js";

// A biblioteca fornece entidades, handles, seções e tabelas. Este adaptador acrescenta
// somente o group code de espessura do LAYER, ainda não exposto pela API 2.9.
function espessuraLayer(layer, peso) {
  const original = layer.dxfy.bind(layer);
  layer.dxfy = (dx) => {
    original(dx);
    dx.push(370, peso);
  };
}
export function serializarDxf(layout) {
  const dxf = new DxfWriter();
  dxf.setUnits(Units.Meters);
  dxf.setVariable("$MEASUREMENT", { 70: 1 });
  dxf.setVariable("$LUNITS", { 70: 2 });
  dxf.setVariable("$LUPREC", { 70: 6 });
  dxf.setVariable("$INSBASE", { 10: 0, 20: 0, 30: 0 });
  dxf.setVariable("$UCSORG", { 10: 0, 20: 0, 30: 0 });
  dxf.setVariable("$UCSXDIR", { 10: 1, 20: 0, 30: 0 });
  dxf.setVariable("$UCSYDIR", { 10: 0, 20: 1, 30: 0 });
  for (const layer of Object.values(LAYERS)) {
    const registro = dxf.addLayer(layer.nome, layer.cor, "Continuous");
    registro.trueColor = layer.rgb;
    espessuraLayer(registro, layer.peso);
  }
  const fonte = dxf.tables.addStyle("EH_TEXTO");
  fonte.fontFileName = "Arial.ttf";
  const h = layout.alturaTexto;
  const estilo = dxf.addDimStyle("EH_METROS");
  Object.assign(estilo, {
    DIMLFAC: 1,
    DIMSCALE: 1,
    DIMLUNIT: 2,
    DIMDEC: 6,
    DIMZIN: 8,
    DIMTXT: h,
    DIMASZ: h * 0.7,
    DIMTSZ: h * 0.5,
    DIMEXO: h * 0.4,
    DIMEXE: h * 0.7,
    DIMGAP: h * 0.4,
    DIMTAD: 1,
    DIMTIH: 1,
    DIMTOH: 1,
    DIMPOST: "<> m",
    DIMTXSTY: fonte.handle,
    DIMCLRD: 0,
    DIMCLRE: 0,
    DIMCLRT: 0,
  });
  const bloco = dxf.addBlock("EH_SONDAGEM_CONVENCIONAL");
  const opts = { layerName: LAYERS.sondagens.nome };
  bloco.addLine(point3d(0, 0.65), point3d(-0.6, -0.4), opts);
  bloco.addLine(point3d(-0.6, -0.4), point3d(0.6, -0.4), opts);
  bloco.addLine(point3d(0.6, -0.4), point3d(0, 0.65), opts);
  bloco.addLine(point3d(-0.2, 0), point3d(0.2, 0), opts);
  bloco.addLine(point3d(0, -0.2), point3d(0, 0.2), opts);
  const texto = (manager, x, y, valor, altura, largura, layer) => {
    const entidade = manager.addMText(
      point3d(x, y),
      altura,
      escaparMText(valor),
      { width: 0, attachmentPoint: 1, layerName: layer },
    );
    entidade.textStyle = fonte.name;
    // A largura é calculada no layout; width=0 evita novas quebras pelo leitor.
    void largura;
    return entidade;
  };
  for (const e of layout.entidades) {
    const layerName = LAYERS[e.layer].nome;
    if (e.tipo === "linha")
      dxf.addLine(point3d(e.x1, e.y1), point3d(e.x2, e.y2), { layerName });
    else if (e.tipo === "texto")
      texto(dxf, e.x, e.y, e.valor, e.altura, e.largura, layerName);
    else if (e.tipo === "circulo")
      dxf.addCircle(point3d(e.x, e.y), e.raio, { layerName });
    else if (e.tipo === "ponto") dxf.addPoint(e.x, e.y, 0, { layerName });
    else if (e.tipo === "sondagem")
      dxf.addInsert(bloco.name, point3d(e.x, e.y), {
        layerName,
        scaleFactor: { x: e.escala, y: e.escala, z: 1 },
      });
  }
  for (const [indice, dim] of layout.dimensoes.entries()) {
    const { a, c, afastamento } = dim;
    const medida = Math.hypot(c.x - a.x, c.y - a.y),
      ux = (c.x - a.x) / medida,
      uy = (c.y - a.y) / medida;
    const nx = -uy,
      ny = ux,
      sinal = Math.sign(afastamento) || 1;
    const p1 = { x: a.x + nx * afastamento, y: a.y + ny * afastamento },
      p2 = { x: c.x + nx * afastamento, y: c.y + ny * afastamento };
    const meio = {
      x: (p1.x + p2.x) / 2 + nx * sinal * h,
      y: (p1.y + p2.y) / 2 + ny * sinal * h,
    };
    // DIMENSION nativa + bloco gráfico: leitores que não regeneram cotas também exibem a medida.
    const grafico = dxf.addBlock(
      "EH_DIM_" + String(indice + 1).padStart(5, "0"),
    );
    const l = { layerName: LAYERS.cotas.nome };
    grafico.addLine(point3d(p1.x, p1.y), point3d(p2.x, p2.y), l);
    for (const [centro, projetado] of [
      [a, p1],
      [c, p2],
    ]) {
      grafico.addLine(
        point3d(
          centro.x + nx * sinal * h * 0.4,
          centro.y + ny * sinal * h * 0.4,
        ),
        point3d(
          projetado.x + nx * sinal * h * 0.7,
          projetado.y + ny * sinal * h * 0.7,
        ),
        l,
      );
      grafico.addLine(
        point3d(
          projetado.x - (ux + nx) * h * 0.45,
          projetado.y - (uy + ny) * h * 0.45,
        ),
        point3d(
          projetado.x + (ux + nx) * h * 0.45,
          projetado.y + (uy + ny) * h * 0.45,
        ),
        l,
      );
    }
    const label = medida.toFixed(6).replace(/\.?0+$/, "") + " m";
    texto(
      grafico,
      meio.x - label.length * h * 0.27,
      meio.y + h * 0.5,
      label,
      h,
      label.length * h * 0.75,
      LAYERS.cotas.nome,
    );
    const entidade = dxf.addLinearDim(point3d(a.x, a.y), point3d(c.x, c.y), {
      angle: (Math.atan2(c.y - a.y, c.x - a.x) * 180) / Math.PI,
      blockName: grafico.name,
      definitionPoint: point3d(p2.x, p2.y),
      middlePoint: point3d(meio.x, meio.y),
      ActualMeasurement: medida,
      styleName: estilo.name,
      layerName: LAYERS.cotas.nome,
      text: "<>",
    });
    // Bit 32 identifica o bloco usado exclusivamente por esta dimensão (DXF group 70).
    entidade.dimensionType = 32;
  }
  dxf.setCurrentLayerName(LAYERS.estacas.nome);
  return dxf.stringify();
}
