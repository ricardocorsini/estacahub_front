import { Link, Outlet } from "react-router-dom";

import Footer from "./Footer";
import UserMenu from "./UserMenu";


export default function AccountLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold tracking-wider text-white shadow-sm">
                EC
              </span>
              <span>
                <span className="block text-sm font-bold tracking-tight text-slate-900">
                  EstacaCalc
                </span>
                <span className="block text-[10px] text-slate-500">
                  Minha conta
                </span>
              </span>
            </Link>

            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
