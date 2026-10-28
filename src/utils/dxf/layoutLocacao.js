import { limitesLocacao, marcasGrade, passoGrade } from "../locacaoCamera.js";
import { nomeTipoEstaca } from "../estacas.js";
import { posicionarRotulos } from "../locacaoRotulos.js";
import { quebrarTextoLargura, textoCadastro, larguraTexto } from "./texto.js";

export const LAYERS = {
  estacas: {
    nome: "EH_ESTACAS",
    cor: 6,
    rgb: 0x773dcc,
    peso: 35,
    descricao:
      "Circunferência externa real; ponto quando o diâmetro é inválido",
  },
  sondagens: {
    nome: "EH_SONDAGENS",
    cor: 4,
    rgb: 0x008c82,
    peso: 25,
    descricao: "Símbolo convencional de sondagem, sem escala física",
  },
  nomes: {
    nome: "EH_IDENTIFICACOES",
    cor: 7,
    rgb: 0x334155,
    peso: 18,
    descricao: "Referências e identificações dos elementos",
  },
  grade: {
    nome: "EH_REFERENCIA_LOCACAO",
    cor: 8,
    rgb: 0xb8c3d0,
    peso: 9,
    descricao: "Grade coordenada gerada, não são eixos estruturais",
  },
  cotas: {
    nome: "EH_COTAS_PLANTA",
    cor: 3,
    rgb: 0x4b6575,
    peso: 13,
    descricao:
      "DIMENSION em metros, extensões dos centros e cadeias projetadas",
  },
  notas: {
    nome: "EH_CHAMADAS_NOTAS",
    cor: 7,
    rgb: 0x64748b,
    peso: 13,
    descricao: "Chamadas, convenções e notas do desenho",
  },
  quadros: {
    nome: "EH_QUADROS_CADASTRAIS",
    cor: 7,
    rgb: 0x334155,
    peso: 13,
    descricao: "Quadros e textos editáveis, em folhas numeradas",
  },
};

// Layout intermediário: nenhuma regra de câmera, SVG ou seleção entra no desenho.
export function calcularLayoutLocacao(modelo, { geradoEm, carregadoEm }) {
  if (!modelo.obra || !modelo.pontos.length)
    throw new Error("Não há registros para compor um DXF completo.");
  const limites = limitesLocacao(modelo.localizados);
  const fisicos = limitesLocacao(modelo.localizados, true);
  const b = fisicos || { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  const extensao = Math.max(b.maxX - b.minX, b.maxY - b.minY, 1);
  const h = Math.max(0.12, extensao / 140);
  const entidades = [],
    dimensoes = [],
    folhas = [];
  const linha = (x1, y1, x2, y2, layer = "notas") =>
    entidades.push({ tipo: "linha", x1, y1, x2, y2, layer });
  const texto = (x, y, valor, layer = "notas", altura = h, largura = 100 * h) =>
    entidades.push({ tipo: "texto", x, y, valor, layer, altura, largura });
  let maxAnotX = b.maxX + 12 * h;
  let minAnotY = b.minY - 12 * h;
  if (limites) {
    const passo = passoGrade(extensao / 7),
      margem = 8 * h;
    const grid = {
      minX: b.minX - margem,
      maxX: b.maxX + margem,
      minY: b.minY - margem,
      maxY: b.maxY + margem,
    };
    for (const x of marcasGrade(grid.minX, grid.maxX, passo)) {
      linha(x, grid.minY, x, grid.maxY, "grade");
      texto(x, grid.maxY + 2 * h, "X = " + x, "grade", h * 0.8);
    }
    for (const y of marcasGrade(grid.minY, grid.maxY, passo)) {
      linha(grid.minX, y, grid.maxX, y, "grade");
      texto(grid.minX - 23 * h, y, "Y = " + y, "grade", h * 0.8, 22 * h);
    }
    texto(
      grid.minX,
      grid.maxY + 11 * h,
      "PLANTA DE LOCAÇÃO · X/Y EM METROS",
      "nomes",
      h * 1.6,
    );
    texto(
      grid.minX,
      grid.maxY + 7 * h,
      "Grade gerada: referência de locação. Centros em coordenadas absolutas.",
      "notas",
      h,
      130 * h,
    );
    for (const p of modelo.localizados) {
      if (p.tipo === "estaca")
        entidades.push({
          tipo: p.raio == null ? "ponto" : "circulo",
          x: p.x,
          y: p.y,
          raio: p.raio,
          layer: "estacas",
          referencia: p.referencia,
        });
      else
        entidades.push({
          tipo: "sondagem",
          x: p.x,
          y: p.y,
          escala: h * 3,
          layer: "sondagens",
          referencia: p.referencia,
        });
    }
    // Reaproveita a composição de rótulos da interface em um espaço auxiliar em pixels.
    // Nomes extensos ficam integralmente nos quadros, ligados à referência E/S da planta.
    const fator = 11 / h,
      padding = 550,
      topo = 120;
    const pontosRotulos = modelo.localizados.map((p) => ({
      ...p,
      nome: p.nome.length <= 22 ? p.referencia + " · " + p.nome : p.referencia,
      pos: {
        x: padding + (p.x - b.minX) * fator,
        y: topo + (b.maxY - p.y) * fator,
      },
      raioPixels: Math.max(9, (p.raio || 0) * fator + 3),
    }));
    const compostos = posicionarRotulos(pontosRotulos, {
      esquerda: 30,
      topo: 30,
      direita: padding + (b.maxX - b.minX) * fator + 520,
      fundo: topo + (b.maxY - b.minY) * fator + 200,
      maxCaracteres: 100,
      medirTexto: (v) => larguraTexto(v) * 11,
    });
    const trilhos = [];
    for (const p of compostos) {
      if (!p.rotulo) {
        trilhos.push(modelo.localizados.find((item) => item.chave === p.chave));
        continue;
      }
      const x = b.minX + (p.rotulo.x - padding) / fator,
        y = b.maxY - (p.rotulo.y - topo) / fator + h;
      const dx = x - p.x,
        dy = y - h * 0.5 - p.y,
        dist = Math.hypot(dx, dy),
        r = p.raio || 0;
      const inicio =
        dist > r && dist > 0
          ? { x: p.x + (dx * r) / dist, y: p.y + (dy * r) / dist }
          : p;
      linha(inicio.x, inicio.y, x, y - h * 0.5);
      texto(x, y, p.texto, "nomes", h, larguraTexto(p.texto) * h + 2 * h);
      maxAnotX = Math.max(maxAnotX, x + larguraTexto(p.texto) * h + 3 * h);
      minAnotY = Math.min(minAnotY, y - 3 * h);
    }
    // Somente nomes sem espaço livre usam trilhos externos; chamadas diretas não coincidem.
    const cx = b.minX + (b.maxX - b.minX) / 2;
    for (const direita of [false, true]) {
      const itens = trilhos
        .filter((p) => p.x >= cx === direita)
        .sort(
          (a, c) =>
            c.y - a.y || a.x - c.x || a.referencia.localeCompare(c.referencia),
        );
      let cursorY = grid.maxY;
      for (const p of itens) {
        const linhas = quebrarTextoLargura(p.referencia + " · " + p.nome, 30);
        const y = Math.min(p.y + 2 * h, cursorY),
          x = direita ? grid.maxX + 12 * h : grid.minX - 50 * h;
        const alvoX = direita ? x - 2 * h : x + 30 * h;
        linha(p.x, p.y, alvoX, y - h * 0.5);
        linhas.forEach((v, i) =>
          texto(x, y - i * 1.55 * h, v, "nomes", h, 30 * h),
        );
        cursorY = y - linhas.length * 1.55 * h - 2 * h;
        minAnotY = Math.min(minAnotY, cursorY);
        maxAnotX = Math.max(maxAnotX, x + 34 * h);
      }
    }
    const adicionarDimensao = (a, c, afastamento) => {
      if (Math.hypot(c.x - a.x, c.y - a.y) > 0)
        dimensoes.push({ a, c, afastamento });
    };
    // Extensões em planta dos centros. Projeções não são novos pontos cadastrados.
    const a = { x: limites.minX, y: limites.minY },
      dx = limites.maxX - limites.minX,
      dy = limites.maxY - limites.minY;
    adicionarDimensao(a, { x: limites.maxX, y: limites.minY }, -16 * h);
    adicionarDimensao({ x: limites.minX, y: limites.maxY }, a, -30 * h);
    for (const eixo of ["x", "y"]) {
      const valores = [...new Set(modelo.localizados.map((p) => p[eixo]))].sort(
        (a, c) => a - c,
      );
      if (
        valores.length < 3 ||
        valores.length > 10 ||
        valores.some((v, i) => i && v - valores[i - 1] < 9 * h)
      )
        continue;
      for (let i = 1; i < valores.length; i++) {
        if (eixo === "x")
          adicionarDimensao(
            { x: valores[i - 1], y: a.y },
            { x: valores[i], y: a.y },
            -8 * h,
          );
        else
          adicionarDimensao(
            { x: a.x, y: valores[i] },
            { x: a.x, y: valores[i - 1] },
            -20 * h,
          );
      }
    }
    const centros = [
      ...new Map(modelo.localizados.map((p) => [p.x + "/" + p.y, p])).values(),
    ];
    if (centros.length === 2) adicionarDimensao(centros[0], centros[1], 6 * h);
    texto(
      grid.minX,
      Math.min(minAnotY, limites.minY - 20 * h) - 4 * h,
      "Cotas em m: extensões dos centros (ΔX/ΔY); cadeias projetadas quando legíveis. Coordenadas completas nos quadros.",
      "notas",
      h,
      145 * h,
    );
    texto(
      grid.minX,
      Math.min(minAnotY, limites.minY - 20 * h) - 7 * h,
      "Símbolos de sondagem sem escala. Estacas: circunferência externa. Referências E/S ligam aos nomes completos nos quadros.",
      "notas",
      h,
      145 * h,
    );
    maxAnotX = Math.max(maxAnotX, grid.minX + 150 * h);
    // dx/dy podem ser nulos em conjuntos alinhados; nunca se cria dimensão de comprimento zero.
    if (dx === 0 && dy === 0)
      texto(
        grid.minX,
        grid.minY - 15 * h,
        "Centros coincidentes: consulte todas as referências nos quadros.",
        "notas",
      );
  }

  // Pranchas cadastrais editáveis em model space, afastadas de toda a anotação da planta.
  const folhaW = 210 * h,
    folhaH = 145 * h,
    baseX = maxAnotX + 30 * h,
    baseY = b.maxY + 16 * h;
  let pagina,
    cursor,
    secao = "";
  function novaFolha(titulo) {
    secao = titulo.split(" · continuação")[0];
    const indice = folhas.length,
      x = baseX + (indice % 3) * (folhaW + 12 * h),
      y = baseY - Math.floor(indice / 3) * (folhaH + 12 * h);
    pagina = {
      numero: indice + 1,
      titulo,
      x,
      y,
      largura: folhaW,
      altura: folhaH,
    };
    folhas.push(pagina);
    linha(x, y, x + folhaW, y, "quadros");
    linha(x + folhaW, y, x + folhaW, y - folhaH, "quadros");
    linha(x + folhaW, y - folhaH, x, y - folhaH, "quadros");
    linha(x, y - folhaH, x, y, "quadros");
    texto(
      x + 6 * h,
      y - 5 * h,
      "ESTACAHUB / DOCUMENTAÇÃO DE LOCAÇÃO",
      "quadros",
      h * 1.3,
      195 * h,
    );
    texto(x + 6 * h, y - 9 * h, titulo, "quadros", h * 1.15, 195 * h);
    linha(x + 6 * h, y - 13 * h, x + folhaW - 6 * h, y - 13 * h, "quadros");
    texto(
      x + 6 * h,
      y - folhaH + 5 * h,
      "Obra ID " +
        textoCadastro(modelo.obra.id) +
        " · Folha " +
        pagina.numero +
        " · Modelo em m / 1:1",
      "quadros",
      h * 0.85,
      195 * h,
    );
    cursor = y - 17 * h;
  }
  function iniciarSecao(titulo, minimo = 35 * h) {
    secao = titulo;
    if (!pagina || cursor - minimo < pagina.y - folhaH + 10 * h)
      novaFolha(titulo);
    else {
      cursor -= 5 * h;
      texto(pagina.x + 6 * h, cursor, titulo, "quadros", h * 1.15, 198 * h);
      cursor -= 5 * h;
    }
  }
  function assegurar(altura, cabecalho) {
    if (cursor - altura < pagina.y - folhaH + 10 * h) {
      novaFolha(secao + " · continuação");
      if (cabecalho) cabecalho();
    }
  }
  function paragrafo(rotulo, valor) {
    const linhas = quebrarTextoLargura(
      rotulo + ": " + textoCadastro(valor),
      198,
    );
    for (const v of linhas) {
      assegurar(1.65 * h);
      texto(pagina.x + 6 * h, cursor, v, "quadros", h, 198 * h);
      cursor -= 1.65 * h;
    }
    cursor -= h;
  }
  function tabela(titulo, colunas, linhas, identificacao) {
    iniciarSecao(titulo);
    if (identificacao) paragrafo("Sondagem", identificacao);
    const largura = 198 * h,
      fator = largura / colunas.reduce((s, c) => s + c.peso, 0);
    const cols = colunas.map((c) => ({ ...c, w: c.peso * fator }));
    function desenharCelulas(valores, altura, cabecalho = false) {
      let x = pagina.x + 6 * h;
      for (let i = 0; i < cols.length; i++) {
        linha(x, cursor, x, cursor - altura, "quadros");
        valores[i].forEach((v, j) =>
          texto(
            x + 0.8 * h,
            cursor - 0.8 * h - j * 1.6 * h,
            v,
            "quadros",
            h * (cabecalho ? 0.9 : 1),
            cols[i].w - 1.6 * h,
          ),
        );
        linha(x, cursor - altura, x + cols[i].w, cursor - altura, "quadros");
        x += cols[i].w;
      }
      linha(x, cursor, x, cursor - altura, "quadros");
      cursor -= altura;
    }
    const cabecalho = () => {
      const labels = cols.map((c) => quebrarTextoLargura(c.nome, c.w / h - 2));
      const altura =
        Math.max(...labels.map((l) => l.length)) * 1.6 * h + 1.7 * h;
      linha(pagina.x + 6 * h, cursor, pagina.x + 204 * h, cursor, "quadros");
      desenharCelulas(labels, altura, true);
    };
    cabecalho();
    if (!linhas.length) {
      cursor -= 2 * h;
      paragrafo("Registros", "Nenhum registro cadastrado.");
    }
    for (const valores of linhas) {
      const quebradas = valores.map((v, i) =>
        quebrarTextoLargura(v, cols[i].w / h - 2),
      );
      const comprimento = Math.max(...quebradas.map((v) => v.length));
      let inicio = 0;
      while (inicio < comprimento) {
        assegurar(3.3 * h, cabecalho);
        const cabem = Math.max(
          1,
          Math.floor(
            (cursor - (pagina.y - folhaH + 10 * h) - 1.7 * h) / (1.6 * h),
          ),
        );
        const tamanho = Math.min(cabem, comprimento - inicio);
        const celulas = quebradas.map((v) => v.slice(inicio, inicio + tamanho));
        desenharCelulas(celulas, tamanho * 1.6 * h + 1.7 * h);
        inicio += tamanho;
        if (inicio < comprimento) {
          novaFolha(titulo + " · continuação de registro");
          cabecalho();
        }
      }
    }
  }
  const o = modelo.obra;
  novaFolha("Dados da obra e convenções");
  for (const [label, key] of [
    ["Nome", "nome"],
    ["Número", "numero"],
    ["Localização", "localizacao"],
    ["Data de cadastro", "dataCadastro"],
    ["Sistema de coordenadas informado", "sistemaCoordenadas"],
    ["Responsável técnico", "responsavelTecnico"],
    ["Observações", "observacoes"],
    ["Legenda da foto (somente metadado)", "legendaFoto"],
    ["Identificador", "id"],
    ["Criado em", "criadoEm"],
    ["Atualizado em", "atualizadoEm"],
  ])
    paragrafo(label, o[key]);
  paragrafo("Base consultada em", carregadoEm);
  paragrafo("Arquivo gerado em", geradoEm);
  for (const [label, valor] of [
    [
      "Unidades",
      "Modelo planimétrico 2D em metros, escala geométrica 1:1, INSUNITS=6. Diâmetros dos quadros em cm; cargas em tf. Z=0 apenas para o plano do desenho.",
    ],
    [
      "Referencial",
      "Coordenadas absolutas preservadas. Sistema local/UTM conforme cadastro; não há fuso, hemisfério, datum ou EPSG completos. Não há conversão geográfica ou indicação de norte.",
    ],
    [
      "Locação",
      "Grade gerada somente como referência de locação. Não representa eixos estruturais, terreno, edificação ou origem topográfica oficial.",
    ],
    [
      "Cotagem",
      "DIMENSION em m (DIMLFAC=1 e DIMSCALE=1). Extensões X/Y dos centros; cadeias projetadas apenas com 3 a 10 ordenadas distintas e espaçamento legível. Com dois centros distintos, há também a distância direta. Coordenadas X/Y completas em todos os quadros.",
    ],
    [
      "Geometria",
      "Estaca: raio externo = diâmetro cm / 200. Se inválido, somente ponto de centro. Sondagens: triângulo convencional sem escala física. Não se infere seção interna, espessura, armadura, comprimento ou vínculo estaca–sondagem.",
    ],
    [
      "Altimetria",
      "Cota de arrasamento e cota de boca são atributos altimétricos; não são dimensões de planta nem profundidades de um modelo 3D.",
    ],
    [
      "Ausências",
      "Não informado indica campo ausente ou inválido. Zeros reais são mantidos. Registros sem X e Y finitos não têm geometria; permanecem nos quadros e pendências.",
    ],
    [
      "Rastreabilidade",
      "Gerado em identifica somente a emissão deste arquivo. Cada data de atualização pertence ao respectivo cadastro. Filtros, zoom e seleção da tela não alteram o conteúdo.",
    ],
    [
      "Metadados de foto",
      "Somente legenda retornada pela API. Não há bytes de foto disponíveis e nenhuma imagem foi incorporada.",
    ],
    [
      "Textos",
      "Quebras de linha e paginação preservam conteúdo; controles não imprimíveis são substituídos por espaços. Textos são entidades MTEXT editáveis.",
    ],
    [
      "Capacidade estrutural",
      "Valor cadastrado pelo usuário; não representa capacidade geotécnica calculada.",
    ],
  ])
    paragrafo(label, valor);
  iniciarSecao("Legenda de layers e símbolos", 70 * h);
  for (const layer of Object.values(LAYERS))
    paragrafo(layer.nome, layer.descricao);
  const ly = cursor - 4 * h;
  entidades.push({
    tipo: "circulo",
    x: pagina.x + 10 * h,
    y: ly,
    raio: 2 * h,
    layer: "notas",
  });
  texto(
    pagina.x + 16 * h,
    ly + h,
    "Estaca: circunferência externa (amostra gráfica de legenda)",
    "quadros",
  );
  entidades.push({
    tipo: "sondagem",
    x: pagina.x + 10 * h,
    y: ly - 9 * h,
    escala: 4 * h,
    layer: "notas",
  });
  texto(
    pagina.x + 16 * h,
    ly - 8 * h,
    "Sondagem: símbolo convencional sem escala física",
    "quadros",
  );
  cursor = ly - 15 * h;
  const colsEstaca = [
    ["Ref.", 7],
    ["Nome / ID / rastreio", 30],
    ["X (m)", 16],
    ["Y (m)", 16],
    ["Tipo", 24],
    ["Diâmetro (cm)", 12],
    ["Capacidade estrutural (tf) cadastrada", 18],
    ["Arrasamento (m)", 16],
    ["Carga prevista (tf)", 16],
    ["Locação", 13],
  ].map(([nome, peso]) => ({ nome, peso }));
  tabela(
    "Quadro cadastral de estacas",
    colsEstaca,
    modelo.estacas.map((p) => {
      const e = p.dados;
      return [
        p.referencia,
        p.nome +
          "\nID: " +
          textoCadastro(e.id) +
          "\nCriado: " +
          textoCadastro(e.criadoEm) +
          "\nAtualizado: " +
          textoCadastro(e.atualizadoEm),
        p.x,
        p.y,
        nomeTipoEstaca(e.tipo),
        e.diametroCm,
        e.capacidadeEstruturalTf,
        e.cotaArrasamento,
        e.cargaPrevistaTf,
        p.x == null || p.y == null ? "Sem locação" : "Localizado",
      ];
    }),
  );
  tabela(
    "Quadro cadastral de sondagens",
    [
      ["Ref.", 7],
      ["Nome / ID / rastreio", 36],
      ["X (m)", 19],
      ["Y (m)", 19],
      ["Cota boca (m)", 15],
      ["Prof. final (m)", 15],
      ["Critério", 24],
      ["Nível água (m)", 15],
      ["Locação", 15],
    ].map(([nome, peso]) => ({ nome, peso })),
    modelo.sondagens.map((p) => {
      const e = p.dados,
        c = e.dadosCabecalho || {};
      return [
        p.referencia,
        p.nome +
          "\nID: " +
          textoCadastro(e.id) +
          "\nCriado: " +
          textoCadastro(e.criadoEm) +
          "\nAtualizado: " +
          textoCadastro(e.atualizadoEm),
        p.x,
        p.y,
        c.cotaBoca,
        c.profundidadeFinal,
        c.criterio,
        c.nivelAgua,
        p.x == null || p.y == null ? "Sem locação" : "Localizado",
      ];
    }),
  );
  for (const p of modelo.sondagens) {
    // Um furo por conjunto de folhas, inclusive quando não possui leituras.
    const e = p.dados;
    tabela(
      "Leituras SPT · " + p.referencia,
      [
        ["Ordem / ID", 15],
        ["Profundidade (m)", 20],
        ["Cota (m)", 20],
        ["NSPT", 15],
        ["Solo", 70],
        ["Família", 40],
      ].map(([nome, peso]) => ({ nome, peso })),
      (e.leituras || []).map((l, i) => [
        String(i + 1) + " / " + textoCadastro(l.id),
        l.profundidade,
        l.cota,
        l.nspt,
        l.solo,
        l.familia,
      ]),
      p.nome + " · ID " + textoCadastro(e.id),
    );
  }
  tabela(
    "Pendências · elementos sem locação",
    [
      ["Ref.", 12],
      ["Elemento / ID", 55],
      ["Tipo", 25],
      ["X informado (m)", 30],
      ["Y informado (m)", 30],
      ["Pendência", 45],
    ].map(([nome, peso]) => ({ nome, peso })),
    modelo.semLocacao.map((p) => [
      p.referencia,
      p.nome + "\nID: " + textoCadastro(p.dados.id),
      p.tipo,
      p.x,
      p.y,
      "X e Y finitos são necessários para representar o centro.",
    ]),
  );
  return {
    entidades,
    dimensoes,
    folhas,
    alturaTexto: h,
    limites,
    planta: limites != null,
  };
}
