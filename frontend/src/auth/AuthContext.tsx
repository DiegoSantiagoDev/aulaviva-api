import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '../api/cliente.ts';
import type { Papel } from '../api/tipos.ts';
import { assinarSessao, encerrarSessao, lerSessao, salvarSessao, type MotivoSaida, type Sessao } from './sessao.ts';

interface AuthContextValue {
  sessao: Sessao | null;
  papel: Papel | null;
  /** Autentica no backend; lança ApiError (401 credenciais, 403 conta pendente/rejeitada). */
  entrar: (email: string, senha: string) => Promise<Sessao>;
  sair: () => void;
  /** Preenchido quando a sessão acabou por expiração ou 401; limpo no próximo login. */
  motivoSaida: MotivoSaida | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* eslint-disable-next-line react-refresh/only-export-components */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}

const MAX_TIMEOUT = 2_147_483_647;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => lerSessao());
  const [motivoSaida, setMotivoSaida] = useState<MotivoSaida | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  // Mantém o contexto sincronizado com qualquer mudança vinda do módulo de sessão
  // (por exemplo, um 401 detectado pela camada HTTP).
  useEffect(() => {
    return assinarSessao((nova, motivo) => {
      setSessao(nova);
      if (!nova) setMotivoSaida(motivo ?? null);
      else setMotivoSaida(null);
    });
  }, []);

  // Expiração: temporizador até o fim da validade + conferência ao voltar para a aba
  // (navegadores atrasam temporizadores de abas em segundo plano).
  useEffect(() => {
    window.clearTimeout(temporizador.current);
    if (!sessao) return;

    const conferir = () => {
      if (sessao.expiraEm <= Date.now()) encerrarSessao('expirada');
    };
    const restante = Math.min(Math.max(sessao.expiraEm - Date.now(), 0), MAX_TIMEOUT);
    temporizador.current = window.setTimeout(conferir, restante + 250);

    const aoVoltar = () => {
      if (document.visibilityState === 'visible') conferir();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearTimeout(temporizador.current);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [sessao]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await api.entrar({ email: email.trim(), password: senha });
    const expira = Date.parse(resposta.expiresAt);
    const nova: Sessao = {
      token: resposta.token,
      expiraEm: Number.isNaN(expira) ? Date.now() + 8 * 3600_000 : expira,
      nome: resposta.name,
      papel: resposta.role,
    };
    salvarSessao(nova);
    return nova;
  }, []);

  const sair = useCallback(() => encerrarSessao('saiu'), []);

  const valor = useMemo<AuthContextValue>(
    () => ({ sessao, papel: sessao?.papel ?? null, entrar, sair, motivoSaida }),
    [sessao, entrar, sair, motivoSaida]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
