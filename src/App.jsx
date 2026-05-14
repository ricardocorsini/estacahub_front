import { useState } from 'react';

function App() {
  const [isBlue, setIsBlue] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4">
          Teste do Tailwind CSS
        </h1>

        <p className="text-lg text-slate-300 mb-6">
          Se o Tailwind estiver funcionando, esta página terá fundo escuro,
          espaçamento, bordas arredondadas e a palavra{' '}
          <span
            className={`font-bold transition-colors duration-300 ${
              isBlue ? 'text-blue-400' : 'text-emerald-400'
            }`}
          >
            destaque
          </span>{' '}
          mudará de cor ao clicar no botão.
        </p>

        <button
          onClick={() => setIsBlue(!isBlue)}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 active:scale-95 transition"
        >
          Alterar cor da palavra
        </button>
      </div>
    </main>
  );
}

export default App;