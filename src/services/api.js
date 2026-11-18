const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "https://api.estacahub.com/api"
  : "http://localhost:8000/api";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export const AUTH_UNAUTHORIZED_EVENT = "estacahub:unauthorized";

function obterMensagemErro(data, status) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.detail?.mensagem === "string") {
    return data.detail.mensagem;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");
  }

  return data?.message || `Erro na requisição: ${status}`;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const config = {
    ...options,
    headers,
    credentials: options.credentials || "include",
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(
      "Não foi possível conectar à API. Verifique sua conexão e tente novamente.",
      { cause: error },
    );
  }

  const data = await response.json().catch(() => null);
  options.signal?.throwIfAborted();

  if (!response.ok) {
    if (
      response.status === 401 &&
      endpoint !== "/auth/login"
    ) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    const error = new Error(obterMensagemErro(data, response.status));
    error.status = response.status;
    error.codigo = data?.detail?.codigo;
    throw error;
  }

  return data;
}

export { API_BASE_URL };
