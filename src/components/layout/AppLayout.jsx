import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Background com padrão de grid técnico */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />

      <Sidebar />

      <div className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-[calc(100vh-130px)] w-full p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}