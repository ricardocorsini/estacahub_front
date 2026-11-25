import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { obra, estacas, sondagens } from "../fixture.js";
import { resultado } from "../fixtureCarga.js";

async function abrir(page, calcular) {
  const listas = {
    "/api/auth/me": { id: 1, nome: "Teste", email: "teste@example.com" },
    "/api/obras": [obra], "/api/obras/1": obra,
    "/api/obras/1/estacas": [estacas[0]], "/api/obras/1/sondagens": sondagens,
  };
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path in listas) return route.fulfill({ json: listas[path] });
    if (path === "/api/obras/1/estacas/11/carga-admissivel") return calcular(route, route.request().postDataJSON());
    return route.fulfill({ status: 404, json: { detail: "Not Found" } });
  });
  await page.goto("/obras/1/relatorios");
}

test("baixa quatro formatos da mesma preparação, preserva a cota zero e registra o perfil inválido", async ({ page }) => {
  const pedidos = [];
  await abrir(page, (route, payload) => {
    pedidos.push(payload);
    if (payload.sondagemId === 22) return route.fulfill({ status: 422,
      json: { detail: { codigo: "sem_leituras_spt", mensagem: "Sondagem sem leituras." } } });
    return route.fulfill({ json: resultado(payload) });
  });
  await page.getByRole("button", { name: "Preparar relatórios" }).click();
  await expect(page.getByText(/1 de 2 pares sem resultado/)).toBeVisible();
  expect(pedidos).toHaveLength(3);
  expect(pedidos[1].cotaPontaM).toBe(0);
  for (const [nome, assinatura] of [["Planilha XLSX", "PK"], ["PDF compacto", "%PDF"], ["PDF completo", "%PDF"], ["JSON de intercâmbio", "{"]]) {
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar " + nome }).click();
    const arquivo = await download;
    const bytes = await readFile(await arquivo.path());
    expect(bytes.subarray(0, assinatura.length).toString()).toBe(assinatura);
    if (assinatura === "{") {
      const r = JSON.parse(bytes);
      expect(r.versao).toBe("1.0.0");
      expect(r.analises[0].resultado.memorial.cotaPontaM).toBe(0);
      expect(r.analises[1].codigo).toBe("sem_leituras_spt");
      expect(r.sondagens[1].dadosCabecalho.cotaBoca).toBeNull();
    }
  }
  expect(pedidos).toHaveLength(3);
  await page.getByRole("combobox", { name: "Sondagens", exact: true }).selectOption("21");
  await expect(page.getByRole("button", { name: "Baixar PDF completo" })).toBeDisabled();
});

test("falha de servidor impede exportação parcial e permite preparar novamente", async ({ page }) => {
  let falhar = true;
  await abrir(page, (route, payload) => {
    if (falhar) return route.fulfill({ status: 503, json: { detail: "Serviço indisponível." } });
    return route.fulfill({ json: resultado(payload) });
  });
  await page.getByRole("combobox", { name: "Sondagens", exact: true }).selectOption("21");
  await page.getByRole("button", { name: "Preparar relatórios" }).click();
  await expect(page.getByRole("alert")).toContainText("Serviço indisponível");
  await expect(page.getByRole("button", { name: "Baixar Planilha XLSX" })).toBeDisabled();
  falhar = false;
  await page.getByRole("button", { name: "Preparar relatórios" }).click();
  await expect(page.getByRole("button", { name: "Baixar Planilha XLSX" })).toBeEnabled();
});
