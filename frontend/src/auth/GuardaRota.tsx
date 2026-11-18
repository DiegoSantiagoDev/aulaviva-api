import { useEffect, type ReactNode } from 'react';
import { useRoteador } from '../app/Roteador.tsx';
import type { Papel } from '../api/tipos.ts';
import { useAuth } from './AuthContext.tsx';
import Pagina403 from '../pages/Pagina403.tsx';

interface GuardaRotaProps {
  /** Papéis que podem ver a rota. */
  papeis: Papel[];
  children: ReactNode;
}

/**
 * Proteção de rota no frontend. Sem sessão: vai para o login e volta depois.
 * Papel errado: tela de acesso negado. A segurança definitiva continua no backend
 * (Spring Security); aqui só evitamos telas e chamadas que seriam recusadas.
 */
export default function GuardaRota({ papeis, children }: GuardaRotaProps) {
  const { sessao, motivoSaida } = useAuth();
  const { rota, navegar } = useRoteador();

  useEffect(() => {
    if (!sessao) {
      const params = new URLSearchParams({ proximo: rota });
      if (motivoSaida === 'expirada') params.set('motivo', 'expirada');
      navegar(`/entrar?${params.toString()}`);
    }
  }, [sessao, motivoSaida, rota, navegar]);

  if (!sessao) return null;
  if (!papeis.includes(sessao.papel)) return <Pagina403 />;
  return <>{children}</>;
}
