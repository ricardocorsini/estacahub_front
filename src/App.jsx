import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Home from "./pages/Home";
import PerfilUsuario from "./pages/PerfilUsuario";
import NotFound from "./pages/NotFound";

import DadosObra from "./pages/workspace/DadosObra";
import Sondagens from "./pages/workspace/Sondagens";
import LocacaoMapa from "./pages/workspace/LocacaoMapa";
import CadastroEstacas from "./pages/workspace/CadastroEstacas";
import CargaAdmissivel from "./pages/workspace/CargaAdmissivel";
import Resultados from "./pages/workspace/Resultados";
import Relatorios from "./pages/workspace/Relatorios";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela inicial simples, sem sidebar */}
        <Route path="/" element={<Home />} />

        {/* Perfil pode continuar separado por enquanto */}
        <Route path="/perfil" element={<PerfilUsuario />} />

        {/* Workspace da obra */}
        <Route path="/obras/:obraId" element={<AppLayout />}>
          <Route index element={<Navigate to="dados" replace />} />
          <Route path="dados" element={<DadosObra />} />
          <Route path="sondagens" element={<Sondagens />} />
          <Route path="locacao-mapa" element={<LocacaoMapa />} />
          <Route path="cadastro-estacas" element={<CadastroEstacas />} />
          <Route path="carga-admissivel" element={<CargaAdmissivel />} />
          <Route path="resultados" element={<Resultados />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}