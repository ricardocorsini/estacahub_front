import { expect, test } from "@playwright/test";
import { obra } from "../fixture.js";

test("a obra de exemplo é opcional, permite nova tentativa e abre a cópia retornada", async ({ page }) => {
  let chamadas = 0;
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill({ json: { id: 1, nome: "Teste", email: "teste@example.com" } });
    if (path === "/api/obras/exemplos/balsas") {
      expect(route.request().method()).toBe("POST");
      chamadas += 1;
      return chamadas === 1 ? route.fulfill({ status: 503, json: { detail: "Servidor indisponível." } })
        : route.fulfill({ json: obra });
    }
    if (path === "/api/obras") return route.fulfill({ json: chamadas === 2 ? [obra] : [] });
    if (path === "/api/obras/1") return route.fulfill({ json: obra });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Nova obra", exact: true }).first().click();
  const abrir = page.getByRole("button", { name: "Abrir exemplo de Balsas" });
  await expect(abrir).toBeHidden();
  await page.getByText("Usar uma obra de exemplo", { exact: true }).click();
  expect(chamadas).toBe(0);
  await abrir.click();
  await expect(page.getByRole("alert")).toContainText("Servidor indisponível.");
  await abrir.click();
  await expect(page).toHaveURL(/\/obras\/1\/dados$/);
  expect(chamadas).toBe(2);
});
