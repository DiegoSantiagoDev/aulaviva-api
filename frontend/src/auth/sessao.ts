import type { Papel } from '../api/tipos.ts';

/**
 * Sessão no sessionStorage: sobrevive ao recarregamento e acaba ao fechar a aba.
 * O JWT não é renovado pelo backend (não há refresh): ao expirar, novo login.
 * Atenção: qualquer armazenamento acessível ao JavaScript é exposto a XSS;
 * por isso o app não injeta HTML e o token nunca vai para a URL nem para logs.
 */
const CHAVE = 'aulaviva.sessao.v1';

export interface Sessao {
  token: string;
  /** Instante de expiração em milissegundos (epoch). */
  expiraEm: number;
  nome: string;
  papel: Papel;
}

export type MotivoSaida = 'expirada' | 'saiu';

type Ouvinte = (sessao: Sessao | null, motivo?: MotivoSaida) => void;
const ouvintes = new Set<Ouvinte>();

function papelValido(valor: unknown): valor is Papel {
  return valor === 'ADMIN' || valor === 'PROFESSOR' || valor === 'ALUNO';
}

export function lerSessao(): Sessao | null {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto) as Partial<Sessao>;
    if (
      typeof dados.token !== 'string' ||
      typeof dados.expiraEm !== 'number' ||
      typeof dados.nome !== 'string' ||
      !papelValido(dados.papel)
    ) {
      window.sessionStorage.removeItem(CHAVE);
      return null;
    }
    if (dados.expiraEm <= Date.now()) {
      window.sessionStorage.removeItem(CHAVE);
      return null;
    }
    return dados as Sessao;
  } catch {
    return null;
  }
}

export function obterToken(): string | null {
  return lerSessao()?.token ?? null;
}

export function salvarSessao(sessao: Sessao): void {
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
  } catch {
    // Armazenamento indisponível (modo privado restrito): a sessão vale só em memória do contexto.
  }
  ouvintes.forEach((o) => o(sessao));
}

/** Apaga a sessão e avisa quem estiver ouvindo (contexto de autenticação). */
export function encerrarSessao(motivo: MotivoSaida): void {
  try {
    window.sessionStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
  ouvintes.forEach((o) => o(null, motivo));
}

export function assinarSessao(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}
