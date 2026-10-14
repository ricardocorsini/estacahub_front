import { useCallback, useEffect, useState } from "react";

import {
  OBRAS_ATUALIZADAS_EVENT,
  obrasService,
} from "../services/obrasService";

// Header e sidebar compartilham a mesma consulta e a mesma identificação da obra.
export function useWorkspaceObras() {
  const [obras, setObras] = useState([]);
  const [carregandoObras, setCarregandoObras] = useState(true);
  const [erroObras, setErroObras] = useState("");
  const [revisao, setRevisao] = useState(0);

  const atualizarObras = useCallback(() => {
    setCarregandoObras(true);
    setErroObras("");
    setRevisao((valor) => valor + 1);
  }, []);

  useEffect(() => {
    let ativo = true;

    obrasService
      .listar()
      .then((dados) => {
        if (!ativo) return;
        if (!Array.isArray(dados)) {
          throw new Error("Não foi possível carregar a lista de obras.");
        }
        setObras(dados);
        setErroObras("");
      })
      .catch((error) => {
        if (ativo)
          setErroObras(
            error.message || "Não foi possível carregar a lista de obras.",
          );
      })
      .finally(() => {
        if (ativo) setCarregandoObras(false);
      });

    return () => {
      ativo = false;
    };
  }, [revisao]);

  useEffect(() => {
    window.addEventListener(OBRAS_ATUALIZADAS_EVENT, atualizarObras);
    return () =>
      window.removeEventListener(OBRAS_ATUALIZADAS_EVENT, atualizarObras);
  }, [atualizarObras]);

  return { obras, carregandoObras, erroObras, atualizarObras };
}
