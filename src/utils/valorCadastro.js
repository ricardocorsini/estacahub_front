export function valorCadastro(v) {
  if (
    v == null ||
    String(v).trim() === "" ||
    (typeof v === "number" && !Number.isFinite(v))
  )
    return "Não informado";
  return String(v);
}
