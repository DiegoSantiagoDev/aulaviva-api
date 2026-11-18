import type { Papel } from '../api/tipos.ts';

/** Quem pode abrir cada área (espelha as regras do SecurityConfig do backend). */
export function podeAcessar(rota: string, papel: Papel | null): boolean {
  if (rota === '/admin' || rota.startsWith('/admin/')) return papel === 'ADMIN';
  if (rota === '/professor' || rota.startsWith('/professor/')) return papel === 'PROFESSOR' || papel === 'ADMIN';
  return true;
}

function rotaInicial(papel: Papel): string {
  if (papel === 'ADMIN') return '/admin';
  if (papel === 'PROFESSOR') return '/professor';
  return '/aulas';
}

/**
 * Para onde ir depois do login: a rota que o usuário tentava abrir, se for
 * interna e permitida para o papel; senão, a área inicial do papel.
 */
export function destinoPosLogin(papel: Papel, proximo: string | null): string {
  const seguro =
    proximo && proximo.startsWith('/') && !proximo.startsWith('//') && !/^\/(entrar|cadastro)/.test(proximo);
  if (seguro && podeAcessar(proximo, papel)) return proximo;
  return rotaInicial(papel);
}
