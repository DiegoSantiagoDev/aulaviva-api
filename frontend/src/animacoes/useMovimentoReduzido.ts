import { useSyncExternalStore } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

function assinar(aoMudar: () => void): () => void {
  const mql = window.matchMedia(CONSULTA);
  mql.addEventListener('change', aoMudar);
  return () => mql.removeEventListener('change', aoMudar);
}

/** `true` quando o sistema pede menos movimento; reage a mudanças em tempo real. */
export function useMovimentoReduzido(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => false
  );
}
