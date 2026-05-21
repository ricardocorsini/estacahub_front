import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Background com padrão de Grid Técnico (Remete à Engenharia) */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />

      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col h-full overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl w-full p-4 md:p-8 lg:p-10 min-h-[calc(100vh-130px)]">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}