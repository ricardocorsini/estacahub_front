import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Home from "./pages/Home";
import PerfilUsuario from "./pages/PerfilUsuario";
import NovaSondagem from "./pages/NovaSondagem";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/nova-sondagem" element={<NovaSondagem />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}