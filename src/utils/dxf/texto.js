// Os textos permanecem Unicode (DXF AC1021 / UTF-8). Somente o layout introduz formatação.
export function textoCadastro(valor) {
  if (
    valor == null ||
    String(valor).trim() === "" ||
    (typeof valor === "number" && !Number.isFinite(valor))
  )
    return "Não informado";
  return String(valor)
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    // eslint-disable-next-line no-control-regex -- sanitização intencional dos controles cadastrais.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, " ");
}
export function escaparMText(valor) {
  return textoCadastro(valor)
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/%/g, "%{}")
    .replace(/\^/g, "^ ")
    .replace(/\n/g, "\\P");
}
export function nomeArquivoObra(obra) {
  const parte = (v) =>
    String(v ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  return (
    "locacao-" +
    (parte(obra.numero) || "obra") +
    "-" +
    (parte(obra.nome) || "sem-nome") +
    "-" +
    (parte(obra.id) || "sem-id") +
    ".dxf"
  );
}

// Estimativa conservadora em múltiplos da altura nominal; evita depender de fontes
// instaladas no navegador e deixa a quebra explícita, igual nos leitores CAD.
export function larguraTexto(valor) {
  return Array.from(String(valor)).reduce((s, c) => {
    const base = c.normalize("NFD")[0];
    if (/\s/.test(c)) return s + 0.42;
    if ("W@".includes(base)) return s + 1.5;
    if ("Mm".includes(base)) return s + 1.35;
    if (base === "w") return s + 1.2;
    if ("ilI.,:;!'|".includes(base)) return s + 0.45;
    if (/[A-Z]/.test(base)) return s + 1.05;
    if (/[0-9]/.test(base)) return s + 0.85;
    if (/[a-z]/.test(base)) return s + 0.85;
    return s + 1.6;
  }, 0);
}
export function quebrarTextoLargura(valor, largura) {
  return textoCadastro(valor)
    .split("\n")
    .flatMap((paragrafo) => {
      const linhas = [];
      let letras = Array.from(paragrafo);
      while (letras.length) {
        let custo = 0,
          fim = 0;
        while (
          fim < letras.length &&
          fim < 160 &&
          (custo + larguraTexto(letras[fim]) <= largura || fim === 0)
        ) {
          custo += larguraTexto(letras[fim]);
          fim++;
        }
        if (fim < letras.length) {
          const espaco = letras.slice(0, fim).lastIndexOf(" ");
          if (espaco > fim / 3) fim = espaco;
        }
        linhas.push(letras.slice(0, fim).join(""));
        letras = letras.slice(fim);
        if (letras[0] === " ") letras.shift();
      }
      return linhas.length ? linhas : [""];
    });
}
