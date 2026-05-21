export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-transparent px-4 py-6 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs font-medium text-slate-500">
          © {new Date().getFullYear()} EstacaCalc. Todos os direitos reservados.
        </p>
        <p className="text-xs text-slate-400">
          V 0.1.0-alpha
        </p>
      </div>
    </footer>
  );
}