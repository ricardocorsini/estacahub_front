/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

import { AUTH_UNAUTHORIZED_EVENT } from "../services/api";
import { authService } from "../services/authService";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      try {
        const usuarioAtual = await authService.obterUsuarioAtual();

        if (ativo) {
          setUsuario(usuarioAtual);
        }
      } catch {
        if (ativo) {
          setUsuario(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    restaurarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function encerrarSessaoLocal() {
      setUsuario(null);
      setCarregando(false);
    }

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      encerrarSessaoLocal,
    );

    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        encerrarSessaoLocal,
      );
    };
  }, []);

  async function entrar(credenciais) {
    const resposta = await authService.entrar(credenciais);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  }

  async function cadastrar(dados) {
    const resposta = await authService.cadastrar(dados);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  }

  async function sair() {
    try {
      await authService.sair();
    } finally {
      setUsuario(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: Boolean(usuario),
        entrar,
        cadastrar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
