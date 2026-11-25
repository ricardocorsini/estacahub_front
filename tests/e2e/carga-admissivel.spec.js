import { expect, test } from "@playwright/test";

import { estacas, obra, sondagens } from "../fixture.js";

import { resultado } from "../fixtureCarga.js";

const ROTA = "/api/obras/1/estacas/11/carga-admissivel";

const OPCOES = {
  desprezaUltimoMetroAtrito: true,
  aplicaRedutorPonta: false,
  tratamentoPonta: "calculado",
  limitaPontaPorAtrito: false,
};

async function prepararApi(page, tratarCalculo) {
  const pedidos = [];
  await page.route("**/api/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const listas = {
      "/api/auth/me": { id: 1, nome: "Engenheiro Teste", email: "teste@example.test" },
      "/api/obras": [obra],
      "/api/obras/1/estacas": estacas,
      "/api/obras/1/sondagens": sondagens,
    };
    if (path in listas) return route.fulfill({ json: listas[path] });
    if (!path.endsWith("/carga-admissivel")) return route.fulfill({ status: 404, json: { detail: "Not Found" } });
    expect(path).toBe(ROTA);
    expect(request.method()).toBe("POST");
    const payload = request.postDataJSON();
    pedidos.push(payload);
    return tratarCalculo?.(route, payload) ?? route.fulfill({ json: resultado(payload) });
  });
  await page.goto("/obras/1/carga-admissivel");
  return pedidos;
}

async function selecionarCadastros(page) {
  await expect(page.getByRole("button", { name: "Calcular", exact: true })).toBeDisabled();
  await page.getByLabel("Estaca", { exact: true }).selectOption("11");
  await page.getByLabel("Sondagem SPT").selectOption("21");
}

test("compara os dois métodos e consulta o memorial da cota zero com as mesmas opções", async ({ page }) => {
  const pedidos = await prepararApi(page);
  await selecionarCadastros(page);
  await page.getByText("Critérios de cálculo", { exact: true }).click();
  await page.getByLabel("Tratamento da ponta").selectOption("contato_com_ressalva");
  await page.getByLabel("Aplicar redutor de ponta por tipo de estaca").check();
  await page.getByRole("button", { name: "Calcular", exact: true }).click();

  const opcoes = { ...OPCOES, tratamentoPonta: "contato_com_ressalva", aplicaRedutorPonta: true };
  const seletorCota = page.getByLabel("Cota de ponta", { exact: true });
  await expect(seletorCota).toHaveValue("0");
  expect(pedidos).toEqual([{ sondagemId: 21, opcoes }]);
  await expect(page.getByText("Verifique o contato de ponta.")).toBeVisible();
  const comparacao = page.getByRole("region", { name: "Tabela por cota de ponta" });
  const linha = comparacao.getByRole("row").filter({ has: page.getByRole("button", { name: "0 m", exact: true }) });
  await expect(linha).toContainText("75,00 tf");
  await expect(linha).toContainText("80,00 tf");

  const grafico = page.getByRole("group", { name: "Gráfico de carga admissível por cota de ponta" });
  await grafico.focus();
  await page.keyboard.press("ArrowDown");
  await expect(seletorCota).toHaveValue("-2");
  await linha.getByRole("button").click();
  await expect(seletorCota).toHaveValue("0");
  await page.getByRole("button", { name: "kN", exact: true }).click();
  await expect(linha).toContainText("735,50 kN");
  expect(pedidos).toHaveLength(1);

  await page.getByRole("button", { name: "Ver memorial da cota" }).click();
  await expect(page.getByRole("heading", { name: "Memorial da cota 0 m" })).toBeVisible();
  expect(pedidos.at(-1)).toEqual({ sondagemId: 21, cotaPontaM: 0, opcoes });
  const ponta = page.getByRole("region", { name: "Leituras de NSPT usadas na ponta" });
  await expect(ponta.getByRole("cell", { name: "65", exact: true })).toBeVisible();
  await expect(ponta.getByRole("cell", { name: "50", exact: true })).toBeVisible();
  await expect(page.getByText("Último metro desprezado")).toBeVisible();
  await expect(page.getByText("Trechos sem contribuição por falta de SPT")).toBeVisible();

  await page.getByLabel("Sondagem SPT").selectOption("22");
  await expect(grafico).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Memorial da cota/ })).toHaveCount(0);
});

test("mostra o erro de perfil e permite recuperar o cálculo e o memorial no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let blocos = 0;
  await prepararApi(page, (route, payload) => {
    blocos += 1;
    if (blocos === 1) {
      return route.fulfill({ status: 422, json: { detail: {
        codigo: "cota_boca_invalida", mensagem: "Informe a cota de boca da sondagem.",
      } } });
    }
    if (blocos === 3) {
      return route.fulfill({ status: 503, json: { detail: "Servidor temporariamente indisponível." } });
    }
    return route.fulfill({ json: resultado(payload) });
  });
  await selecionarCadastros(page);
  const calcular = page.getByRole("button", { name: "Calcular", exact: true });
  await calcular.click();
  await expect(page.getByRole("alert")).toContainText("Informe a cota de boca da sondagem.");
  await expect(page.getByRole("link", { name: "Revisar dados da sondagem" })).toHaveAttribute("href", "/obras/1/sondagens");
  await calcular.click();
  await expect(page.getByLabel("Cota de ponta", { exact: true })).toHaveValue("0");
  await page.getByRole("button", { name: "Ver memorial da cota" }).click();
  await expect(page.getByRole("alert")).toContainText("Servidor temporariamente indisponível.");
  await page.getByRole("button", { name: "Tentar carregar o memorial novamente" }).click();
  await expect(page.getByRole("heading", { name: "Memorial da cota 0 m" })).toBeVisible();
  const medidas = await page.locator("#workspace-conteudo").evaluate((elemento) => ({
    visivel: elemento.clientWidth, total: elemento.scrollWidth,
  }));
  expect(medidas.total).toBeLessThanOrEqual(medidas.visivel + 1);
});

test("uma resposta de memorial cancelada não substitui a cota atual", async ({ page }) => {
  let liberar;
  const respostaLenta = new Promise((resolve) => { liberar = resolve; });
  let respondeuAntiga;
  const antigaFinalizada = new Promise((resolve) => { respondeuAntiga = resolve; });
  const pedidos = await prepararApi(page, async (route, payload) => {
    if (payload.cotaPontaM === 0) {
      await respostaLenta;
      await route.fulfill({ json: resultado(payload) }).catch(() => {});
      respondeuAntiga();
      return;
    }
    await route.fulfill({ json: resultado(payload) });
  });
  await selecionarCadastros(page);
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await page.getByRole("button", { name: "Ver memorial da cota" }).click();
  try {
    await expect.poll(() => pedidos.at(-1)?.cotaPontaM).toBe(0);
    await page.getByLabel("Cota de ponta", { exact: true }).selectOption("-2");
    await expect(page.getByRole("heading", { name: "Memorial da cota -2 m" })).toBeVisible();
  } finally {
    liberar();
  }
  await antigaFinalizada;
  await expect(page.getByRole("heading", { name: "Memorial da cota -2 m" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Memorial da cota 0 m" })).toHaveCount(0);
});
