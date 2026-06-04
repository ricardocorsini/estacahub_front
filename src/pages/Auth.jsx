import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      console.log("Realizando Login com:", { email: formData.email, senha: formData.senha });
      // Lógica de login com FastAPI aqui
    } else {
      console.log("Realizando Cadastro com:", formData);
      // Lógica de registro aqui
    }

    // Simulando o redirecionamento após sucesso
    // navigate("/obras/1/dados");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ nome: "", email: "", senha: "" }); // Reseta o form ao trocar
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background com padrão de grid técnico (mesmo do AppLayout) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />

      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        {/* Logo / Branding */}
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

        {/* Card do Formulário */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo Nome (Apenas Cadastro) */}
              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Engenheiro Responsável"
                    required={!isLogin}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Campo E-mail */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Campo Senha */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="senha" className="block text-sm font-semibold text-slate-700">
                    Senha
                  </label>
                  {isLogin && (
                    <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Botão de Submit */}
              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLogin ? "Entrar na Plataforma" : "Criar Conta"}
              </button>
            </form>
          </div>

          {/* Rodapé do Card (Toggle Login/Cadastro) */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-5 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 focus:outline-none focus:underline"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </div>
        </div>

        {/* Assinatura Corporativa */}
        <p className="mt-8 text-center text-xs font-medium tracking-wide text-slate-400">
          Sistemas e Automação • Desenvolvido por Corsini Code
        </p>
      </div>
    </div>
  );
}