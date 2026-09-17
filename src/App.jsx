import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/auth/RouteGuards";
import AccountLayout from "./components/layout/AccountLayout";
import AppLayout from "./components/layout/AppLayout";

import Home from "./pages/Home";
import PerfilUsuario from "./pages/PerfilUsuario";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

import DadosObra from "./pages/workspace/DadosObra";
import Sondagens from "./pages/workspace/Sondagens";
import LocacaoMapa from "./pages/workspace/LocacaoMapa";
import CadastroEstacas from "./pages/workspace/CadastroEstacas";
import CargaAdmissivel from "./pages/workspace/CargaAdmissivel";
import Resultados from "./pages/workspace/Resultados";
import Relatorios from "./pages/workspace/Relatorios";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={(
              <PublicOnlyRoute>
                <Auth />
              </PublicOnlyRoute>
            )}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />

            <Route element={<AccountLayout />}>
              <Route path="/perfil" element={<PerfilUsuario />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>

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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
