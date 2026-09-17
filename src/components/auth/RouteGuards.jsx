import { LoaderCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Verificando sua sessão...</p>
      </div>
    </div>
  );
}


export function ProtectedRoute() {
  const location = useLocation();
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return <SessionLoader />;
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}


export function PublicOnlyRoute({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return <SessionLoader />;
  }

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}
