import { ApiError } from './tipos.ts';
import { encerrarSessao, obterToken } from '../auth/sessao.ts';

const TIMEOUT_MS = 30000;

export function normalizarErro(err: unknown, fallback: string): ApiError {
  if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
    return err as ApiError;
  }
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      return { status: 0, message: 'A requisição demorou muito para responder (tempo limite excedido).' };
    }
    return { status: 0, message: err.message || fallback };
  }
  return { status: 0, message: fallback };
}

/** Lê `{ message }` do corpo de erro padrão do backend (`ErrorResponse`). */
export function mensagemDoCorpo(texto: string, padrao: string): string {
  try {
    const json = JSON.parse(texto) as { message?: string; error?: string };
    return json.message || json.error || padrao;
  } catch {
    return padrao;
  }
}

interface OpcoesRequisicao extends RequestInit {
  /** Não anexa o JWT (login e cadastro). */
  semToken?: boolean;
}

/**
 * Ponto único de comunicação com a API.
 * - anexa `Authorization: Bearer` quando existe sessão válida;
 * - 401 com token enviado: a sessão é encerrada (expirada ou inválida) e,
 *   em leituras (GET), a chamada é repetida uma vez sem token, porque o
 *   backend recusa até rotas públicas quando recebe um token inválido;
 * - 403 não derruba a sessão: o usuário está logado, só não tem permissão.
 */
export async function requisicao<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { semToken, ...init } = opcoes;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const token = semToken ? null : obterToken();
  const metodo = (init.method ?? 'GET').toUpperCase();

  try {
    const res = await fetch(caminho, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (res.status === 401 && token) {
      encerrarSessao('expirada');
      if (metodo === 'GET') return await requisicao<T>(caminho, { ...opcoes, semToken: true });
    }

    if (!res.ok) {
      const texto = await res.text().catch(() => '');
      throw { status: res.status, message: mensagemDoCorpo(texto, `Erro HTTP ${res.status}`) } as ApiError;
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw normalizarErro(error, 'Falha de comunicação com o servidor.');
  }
}
