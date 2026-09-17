import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const initialFormData = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};


export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar, cadastrar } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setErro("");
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!isLogin && formData.senha !== formData.confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setEnviando(true);

    try {
      if (isLogin) {
        await entrar({
          email: formData.email,
          senha: formData.senha,
        });
      } else {
        await cadastrar({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        });
      }

      const origem = location.state?.from;
      const destino = origem
        ? `${origem.pathname}${origem.search || ""}${origem.hash || ""}`
        : "/";

      navigate(destino, { replace: true });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function toggleMode() {
    setIsLogin((current) => !current);
    setFormData(initialFormData);
    setMostrarSenha(false);
    setErro("");
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold tracking-wider text-white shadow-lg shadow-indigo-600/30">
            EC
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            EstacaCalc
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? "Acesse seu workspace de cálculo"
              : "Crie sua conta para começar"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {isLogin ? "Bem-vindo de volta" : "Nova conta"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLogin
                  ? "Entre com seu e-mail e senha."
                  : "Preencha os dados para acessar a plataforma."}
              </p>
            </div>

            {erro && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <FormField label="Nome completo" htmlFor="nome">
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Engenheiro responsável"
                    autoComplete="name"
                    minLength={2}
                    maxLength={150}
                    required
                    disabled={enviando}
                    className="input-auth"
                  />
                </FormField>
              )}

              <FormField label="E-mail" htmlFor="email">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  disabled={enviando}
                  className="input-auth"
                />
              </FormField>

              <FormField label="Senha" htmlFor="senha">
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    minLength={isLogin ? 1 : 8}
                    maxLength={128}
                    required
                    disabled={enviando}
                    className="input-auth pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Use pelo menos 8 caracteres.
                  </p>
                )}
              </FormField>

              {!isLogin && (
                <FormField label="Confirmar senha" htmlFor="confirmarSenha">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                    disabled={enviando}
                    className="input-auth"
                  />
                </FormField>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
              >
                {enviando && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {enviando
                  ? "Aguarde..."
                  : isLogin
                    ? "Entrar na plataforma"
                    : "Criar conta"}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-8 py-5 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                disabled={enviando}
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 focus:outline-none focus:underline disabled:opacity-60"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium tracking-wide text-slate-400">
          Sistemas e Automação • Desenvolvido por Corsini Code
        </p>
      </div>
    </div>
  );
}


function FormField({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
