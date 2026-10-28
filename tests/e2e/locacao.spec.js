import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import DxfParser from "dxf-parser";
import { obra, estacas, sondagens, fixtureAmpla } from "../fixture.js";

async function api(page, dados = { obra, estacas, sondagens }, options = {}) {
  const methods = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    methods.push(req.method());
    if (path.endsWith("/auth/me"))
      return route.fulfill({
        json: { id: 1, nome: "Engenheiro Teste", email: "teste@example.test" },
      });
    if (path === "/api/obras")
      return route.fulfill({
        json: [dados.obra, { ...dados.obra, id: 2, nome: "Outra obra" }],
      });
    if (options.intercept && (await options.intercept(route, path))) return;
    if (path === "/api/obras/1") return route.fulfill({ json: dados.obra });
    if (path === "/api/obras/1/estacas")
      return route.fulfill({ json: dados.estacas });
    if (path === "/api/obras/1/sondagens")
      return route.fulfill({ json: dados.sondagens });
    if (path === "/api/obras/2")
      return route.fulfill({
        json: { ...dados.obra, id: 2, nome: "Outra obra" },
      });
    if (path.startsWith("/api/obras/2/")) return route.fulfill({ json: [] });
    return route.fulfill({
      status: 404,
      json: { detail: "Fixture não prevista: " + path },
    });
  });
  return { methods, errors };
}
async function abrir(page) {
  await page.goto("/obras/1/locacao-mapa");
  await expect(
    page.getByRole("button", { name: "Exportar DXF completo", exact: true }),
  ).toBeEnabled();
}
const planta = (p) =>
  p.getByRole("group", { name: "Planta interativa de locação", exact: true });
async function camera(page) {
  return JSON.parse(await planta(page).getAttribute("data-camera"));
}
async function painel(page) {
  if (
    !(await page
      .getByRole("heading", { name: "Camadas e elementos", exact: true })
      .isVisible())
  )
    await page.getByRole("button", { name: "Camadas e lista" }).click();
}

test("desktop: pan vs clique, zoom, teclado, seleção, camadas, redimensionamento e sidebar", async ({
  page,
}) => {
  const { methods, errors } = await api(page, fixtureAmpla());
  await abrir(page);
  expect((await planta(page).boundingBox()).height).toBeGreaterThan(560);
  await page.screenshot({ path: "artifacts/mapa-desktop.png", fullPage: true });
  const antes = await camera(page);
  await painel(page);
  await page.getByRole("button", { name: /^E-01 E001/ }).click();
  await expect(
    page.getByRole("complementary", {
      name: "Detalhes do elemento selecionado",
    }),
  ).toBeVisible();
  expect(await camera(page)).toEqual(antes);
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  await page
    .getByRole("checkbox", { name: "Sondagens", exact: true })
    .uncheck();
  expect(await camera(page)).toEqual(antes);
  await page
    .getByRole("button", { name: "Restaurar camadas e elementos" })
    .click();
  await page.getByRole("button", { name: "Recolher painel" }).click();
  const box = await planta(page).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 90,
    box.y + box.height / 2 + 45,
    { steps: 10 },
  );
  await page.mouse.up();
  const pan = await camera(page);
  expect(pan.x).not.toBe(antes.x);
  expect(pan.y).not.toBe(antes.y);
  await page
    .getByRole("button", { name: "Ampliar planta", exact: true })
    .click();
  expect((await camera(page)).mPorPixel).toBeLessThan(pan.mPorPixel);
  await planta(page).focus();
  const focus = await camera(page);
  await page.keyboard.press("ArrowLeft");
  expect((await camera(page)).x).toBeLessThan(focus.x);
  await page
    .getByRole("button", { name: "Restaurar enquadramento geral" })
    .click();
  const c = await camera(page);
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.waitForTimeout(250);
  expect((await camera(page)).x).toBe(c.x);
  expect((await camera(page)).y).toBe(c.y);
  const collapse = page.getByRole("button", {
    name: /Recolher menu lateral|Recolher sidebar|Recolher navegação/,
  });
  if (await collapse.count()) {
    await collapse.click();
    await page.waitForTimeout(250);
    expect((await camera(page)).x).toBe(c.x);
  }
  expect(errors).toEqual([]);
  expect(methods.every((m) => m === "GET")).toBeTruthy();
});

test("coincidentes, tooltip, nomes longos e exportação completa repetida com tudo oculto", async ({
  page,
}) => {
  const { methods, errors } = await api(page);
  await abrir(page);
  await painel(page);
  await page
    .getByRole("button", { name: /^E-01 \/ Fundação de teste E001/ })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "Detalhes do elemento selecionado",
  });
  await expect(
    inspector.getByText("2 elementos nesta coordenada"),
  ).toBeVisible();
  await inspector.getByRole("button", { name: /S001 · SP-01/ }).click();
  await expect(
    inspector.getByRole("heading", { name: "SP-01 · Sondagem coincidente" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  const marker = planta(page).getByRole("button", { name: /^E-02/ });
  await marker.focus();
  await expect(page.getByRole("tooltip")).toContainText(estacas[1].nome);
  await page.getByRole("checkbox", { name: "Estacas", exact: true }).uncheck();
  await page
    .getByRole("checkbox", { name: "Sondagens", exact: true })
    .uncheck();
  await expect(
    page.getByText("Nenhum elemento visível", { exact: true }),
  ).toBeVisible();
  const arquivos = [];
  for (let i = 0; i < 2; i++) {
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Exportar DXF completo", exact: true })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^locacao-[\w-]+\.dxf$/);
    const texto = await readFile(await download.path(), "utf8");
    arquivos.push(new DxfParser().parseSync(texto));
    await expect(
      page.getByRole("button", { name: "Exportar DXF completo", exact: true }),
    ).toBeEnabled();
  }
  for (const dxf of arquivos) {
    expect(dxf.header.$INSUNITS).toBe(6);
    expect(
      dxf.entities.filter(
        (e) => e.type === "CIRCLE" && e.layer === "EH_ESTACAS",
      ),
    ).toHaveLength(2);
    expect(
      dxf.entities.filter(
        (e) => e.type === "INSERT" && e.layer === "EH_SONDAGENS",
      ),
    ).toHaveLength(1);
  }
  expect(arquivos[0].entities.length).toBe(arquivos[1].entities.length);
  expect(methods.every((m) => m === "GET")).toBeTruthy();
  expect(errors).toEqual([]);
});

test("falha parcial bloqueia exportação e atualização recupera a base; sessão expirada", async ({
  page,
}) => {
  let falhar = true,
    expirar = false;
  const { errors } = await api(page, undefined, {
    intercept: async (route, path) => {
      if (path.endsWith("/sondagens") && (falhar || expirar)) {
        await route.fulfill({
          status: expirar ? 401 : 500,
          json: {
            detail: expirar
              ? "Sessão expirada"
              : "Falha de teste nas sondagens",
          },
        });
        return true;
      }
      return false;
    },
  });
  await page.goto("/obras/1/locacao-mapa");
  await expect(page.getByRole("alert")).toContainText(
    "consulta está incompleta",
  );
  await expect(
    page.getByRole("button", { name: "Exportar DXF completo", exact: true }),
  ).toBeDisabled();
  falhar = false;
  await page
    .getByRole("button", { name: "Recarregar obra, estacas e sondagens" })
    .click();
  await expect(
    page.getByRole("button", { name: "Exportar DXF completo", exact: true }),
  ).toBeEnabled();
  expirar = true;
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(errors).toEqual([]);
});

test("troca de obra descarta resposta atrasada, seleção e estado anterior", async ({
  page,
}) => {
  let soltar;
  const pendente = new Promise((resolve) => {
    soltar = resolve;
  });
  await api(page, undefined, {
    intercept: async (route, path) => {
      if (path === "/api/obras/1/sondagens") {
        await pendente;
        await route.fulfill({ json: sondagens }).catch(() => {});
        return true;
      }
      return false;
    },
  });
  await page.goto("/obras/1/locacao-mapa");
  // Navegação do React Router pelo seletor de obras real do workspace.
  const seletor = page.getByRole("combobox", { name: /obra/i });
  if (await seletor.count()) {
    await seletor.selectOption("2");
    await expect(page).toHaveURL("/obras/2/dados");
    await page
      .locator(".workspace-sidebar-desktop")
      .getByRole("link", { name: "Locação / mapa", exact: true })
      .click();
  } else {
    await page.goto("/obras/2/locacao-mapa");
  }
  await expect(
    page.getByRole("heading", { name: "Locação / mapa", exact: true }),
  ).toBeVisible();
  soltar();
  await expect(
    page.getByText(/Esta obra ainda não possui estacas ou sondagens/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Exportar DXF completo", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".loc-heading strong")).toHaveText("Outra obra");
  await expect(page.locator(".loc-element-list")).not.toContainText("SP-01");
});

test("mobile: planta útil, painel inferior, lista pesquisável, inspetor e toque sem overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { errors } = await api(page, fixtureAmpla());
  await abrir(page);
  expect((await planta(page).boundingBox()).height).toBeGreaterThan(530);
  await page.screenshot({ path: "artifacts/mapa-mobile.png", fullPage: true });
  await painel(page);
  await page.getByRole("textbox", { name: "Pesquisar elementos" }).fill("E-03");
  await page.getByRole("button", { name: /^E-03 E003/ }).click();
  await expect(
    page.getByRole("complementary", {
      name: "Detalhes do elemento selecionado",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/mapa-mobile-detalhes.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  await page
    .getByRole("button", { name: "Ativar navegação por toque" })
    .click();
  await expect(
    page.getByRole("button", { name: "Ativar navegação por toque" }),
  ).toHaveAttribute("aria-pressed", "true");
  await planta(page).focus();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Ativar navegação por toque" }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("vazio, um ponto, alinhados, coordenadas grandes e apenas sem locação", async ({
  page,
}) => {
  for (const [es, ss] of [
    [[], []],
    [[estacas[0]], []],
    [
      [
        { ...estacas[0], coordX: -3, coordY: -4 },
        { ...estacas[1], coordX: -3, coordY: 0 },
      ],
      [],
    ],
    [[{ ...estacas[0], coordX: 700000.123456, coordY: 9000000.654321 }], []],
    [[], [sondagens[1]]],
  ]) {
    await page.unroute("**/api/**");
    await api(page, { obra, estacas: es, sondagens: ss });
    await page.goto("/obras/1/locacao-mapa");
    await expect(planta(page)).toBeVisible();
    const c = await camera(page);
    expect(Object.values(c).every(Number.isFinite)).toBeTruthy();
    if (!es.length && !ss.length)
      await expect(
        page.getByRole("button", {
          name: "Exportar DXF completo",
          exact: true,
        }),
      ).toBeDisabled();
    if (!es.length && ss.length)
      await expect(
        page.getByText(/O DXF conterá os quadros cadastrais/),
      ).toBeVisible();
  }
});

test("minimapa e formulário de estacas preservados; CRUD em API simulada isolada", async ({
  page,
}) => {
  const lista = [...estacas];
  let next = 30;
  const writes = [];
  await api(
    page,
    { obra, estacas: lista, sondagens },
    {
      intercept: async (route, path) => {
        const method = route.request().method();
        if (method === "GET") return false;
        const body =
          method !== "DELETE" ? route.request().postDataJSON() : null;
        writes.push(method);
        if (method === "POST") {
          const e = { ...body, id: next++, obraId: 1 };
          lista.push(e);
          await route.fulfill({ json: e });
        } else if (method === "PUT") {
          const id = Number(path.split("/").at(-1));
          const e = { ...body, id, obraId: 1 };
          lista.splice(
            lista.findIndex((v) => v.id === id),
            1,
            e,
          );
          await route.fulfill({ json: e });
        } else {
          const id = Number(path.split("/").at(-1));
          lista.splice(
            lista.findIndex((v) => v.id === id),
            1,
          );
          await route.fulfill({ json: { id, message: "Removida" } });
        }
        return true;
      },
    },
  );
  await page.goto("/obras/1/cadastro-estacas");
  await expect(
    page.getByRole("heading", { name: "Mini-mapa de locação" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Adicionar estaca", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/Nome/).fill("E-TESTE");
  await dialog
    .getByRole("spinbutton", { name: "X (m)", exact: true })
    .fill("0");
  await dialog
    .getByRole("spinbutton", { name: "Y (m)", exact: true })
    .fill("-2");
  await dialog.getByLabel(/Tipo de estaca/).selectOption("helice_continua");
  await dialog.getByRole("spinbutton", { name: /Diâmetro/ }).fill("40");
  await dialog
    .getByRole("spinbutton", { name: /Capacidade estrutural/ })
    .fill("50");
  await dialog
    .getByRole("spinbutton", { name: "Cota de arrasamento (m)", exact: true })
    .fill("0");
  await dialog.getByRole("spinbutton", { name: /Carga prevista/ }).fill("0");
  await dialog
    .getByRole("button", { name: /Salvar|Cadastrar|Criar estaca/ })
    .click();
  await expect(page.getByText("Estaca criada com sucesso.")).toBeVisible();
  await page
    .getByRole("button", { name: "Editar estaca E-TESTE", exact: true })
    .click();
  await dialog.getByLabel(/Nome/).fill("E-EDITADA");
  await dialog.getByRole("button", { name: /Salvar/ }).click();
  await expect(page.getByText("Estaca atualizada com sucesso.")).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Excluir estaca E-EDITADA", exact: true })
    .click();
  await expect(page.getByText("Estaca excluída com sucesso.")).toBeVisible();
  expect(writes).toEqual(["POST", "PUT", "DELETE"]);
});

test("seleção por clique alterna coincidentes; roda comum livre e zoom ancorado no cursor", async ({
  page,
}) => {
  await api(page);
  await abrir(page);
  if (await page.getByRole("button", { name: "Recolher painel" }).isVisible())
    await page.getByRole("button", { name: "Recolher painel" }).click();
  const mapa = planta(page);
  let box = await mapa.boundingBox(),
    c = await camera(page);
  const centro = {
    x: box.x + box.width / 2 - c.x / c.mPorPixel,
    y: box.y + box.height / 2 + c.y / c.mPorPixel,
  };
  await page.mouse.click(centro.x, centro.y);
  await expect(page.locator(".loc-inspector h2")).toHaveText(estacas[0].nome);
  expect(await camera(page)).toEqual(c);
  await page.mouse.click(centro.x, centro.y);
  await expect(page.locator(".loc-inspector h2")).toHaveText(sondagens[0].nome);
  await page.getByRole("button", { name: "Fechar detalhes" }).click();
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.4);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(200);
  expect(await camera(page)).toEqual(c);
  const scroll = await page
    .locator(".workspace-content")
    .evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  box = await mapa.boundingBox();
  c = await camera(page);
  const pos = { x: box.width * 0.3, y: box.height * 0.4 };
  const mundo = {
    x: c.x + (pos.x - box.width / 2) * c.mPorPixel,
    y: c.y - (pos.y - box.height / 2) * c.mPorPixel,
  };
  await page.mouse.move(box.x + pos.x, box.y + pos.y);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -80);
  await page.keyboard.up("Control");
  await expect
    .poll(async () => (await camera(page)).mPorPixel)
    .toBeLessThan(c.mPorPixel);
  const depois = await camera(page); // Eventos de roda podem quantizar clientX/Y a pixels inteiros no Chromium.
  expect(
    Math.abs(depois.x + (pos.x - box.width / 2) * depois.mPorPixel - mundo.x),
  ).toBeLessThan(c.mPorPixel);
  expect(
    Math.abs(depois.y - (pos.y - box.height / 2) * depois.mPorPixel - mundo.y),
  ).toBeLessThan(c.mPorPixel);
});

test("gestos mobile: um dedo move e pinça amplia quando a navegação por toque está ativa", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await api(page, fixtureAmpla());
  await abrir(page);
  await planta(page).scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Ativar navegação por toque" })
    .click();
  const cdp = await context.newCDPSession(page),
    box = await planta(page).boundingBox(),
    c = await camera(page);
  const x = box.x + box.width * 0.4,
    y = box.y + box.height * 0.4;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 40, y: y + 30 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(async () => (await camera(page)).x).not.toBe(c.x);
  const antes = await camera(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 20, y, id: 1 },
      { x: x + 20, y, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 50, y, id: 1 },
      { x: x + 50, y, id: 2 },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => (await camera(page)).mPorPixel)
    .toBeLessThan(antes.mPorPixel);
  await cdp.detach();
});
