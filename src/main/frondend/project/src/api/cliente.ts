import { recursos } from '../config/recursos';
import { mockApi } from './mock';
import {
  LessonListItem,
  LessonResponse,
  CreateLessonRequest,
  ImageResponse,
  PromptsResponse,
  ApiError,
} from './tipos';

const TIMEOUT_MS = 30000;

function normalizarErro(err: unknown, fallbackMessage: string): ApiError {
  if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
    return err as ApiError;
  }
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      return { status: 0, message: 'A requisição demorou muito para responder (tempo limite excedido).' };
    }
    return { status: 0, message: err.message || fallbackMessage };
  }
  return { status: 0, message: fallbackMessage };
}

async function requisicaoJson<T>(
  caminho: string,
  opcoes: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(caminho, {
      ...opcoes,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(opcoes.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let mensagem = `Erro HTTP ${res.status}`;
      try {
        const errorJson = await res.json();
        mensagem = errorJson.message || errorJson.error || mensagem;
      } catch {
        // Sem corpo JSON
      }
      throw { status: res.status, message: mensagem } as ApiError;
    }

    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw normalizarErro(error, 'Falha de comunicação com o servidor.');
  }
}

export const api = {
  /**
   * Lista todas as aulas disponíveis
   */
  listarAulas: async (): Promise<LessonListItem[]> => {
    if (recursos.usarMock) return mockApi.listarAulas();
    return requisicaoJson<LessonListItem[]>('/api/lessons');
  },

  /**
   * Obtém detalhes de uma aula específica
   */
  obterAula: async (id: number): Promise<LessonResponse> => {
    if (recursos.usarMock) return mockApi.obterAula(id);
    return requisicaoJson<LessonResponse>(`/api/lessons/${id}`);
  },

  /**
   * Cadastra uma nova aula (professor)
   */
  criarAula: async (dados: CreateLessonRequest): Promise<LessonResponse> => {
    if (recursos.usarMock) return mockApi.criarAula(dados);
    return requisicaoJson<LessonResponse>('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  },

  /**
   * Envia arquivo de áudio com acompanhamento de progresso real via XMLHttpRequest
   */
  enviarAudio: (
    id: number,
    arquivo: File,
    noProgresso?: (porcentagem: number) => void
  ): Promise<LessonResponse> => {
    if (recursos.usarMock) {
      return mockApi.enviarAudio(id, arquivo, noProgresso);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/lessons/${id}/audio`, true);

      if (noProgresso) {
        xhr.upload.onprogress = (evento) => {
          if (evento.lengthComputable) {
            const porcentagem = Math.round((evento.loaded / evento.total) * 100);
            noProgresso(porcentagem);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resposta = JSON.parse(xhr.responseText);
            resolve(resposta as LessonResponse);
          } catch {
            resolve({ id, status: 'PROCESSING' } as LessonResponse);
          }
        } else {
          let mensagem = `Falha no envio (HTTP ${xhr.status})`;
          try {
            const jsonErro = JSON.parse(xhr.responseText);
            mensagem = jsonErro.message || mensagem;
          } catch {
            // Nada
          }
          reject({ status: xhr.status, message: mensagem } as ApiError);
        }
      };

      xhr.onerror = () => {
        reject({
          status: 0,
          message: 'Não foi possível enviar o áudio. Verifique a conexão e tente novamente.',
        } as ApiError);
      };

      const formData = new FormData();
      formData.append('file', arquivo);
      xhr.send(formData);
    });
  },

  /**
   * Reprocessa uma aula que falhou ou que recebeu novas mídias
   */
  reprocessar: async (id: number): Promise<LessonResponse> => {
    if (recursos.usarMock) return mockApi.reprocessar(id);
    return requisicaoJson<LessonResponse>(`/api/lessons/${id}/reprocess`, {
      method: 'POST',
    });
  },

  /**
   * Envia uma foto do quadro
   */
  enviarImagem: async (id: number, arquivo: File): Promise<ImageResponse> => {
    if (recursos.usarMock) return mockApi.enviarImagem(id, arquivo);

    const formData = new FormData();
    formData.append('file', arquivo);

    const res = await fetch(`/api/lessons/${id}/images`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let msg = 'Erro ao enviar foto do quadro.';
      try {
        const errJson = await res.json();
        msg = errJson.message || msg;
      } catch {
        // Sem corpo JSON
      }
      throw { status: res.status, message: msg } as ApiError;
    }

    return (await res.json()) as ImageResponse;
  },

  /**
   * Obtém os prompts usados para gerar o conteúdo (Como foi gerado)
   */
  obterPrompts: async (id: number): Promise<PromptsResponse> => {
    if (recursos.usarMock) return mockApi.obterPrompts(id);
    // Endpoint ainda não existe no back-end real. O 404/405 é propagado
    // para a tela "Como foi gerado" tratar como "ainda não disponível".
    return requisicaoJson<PromptsResponse>(`/api/lessons/${id}/prompts`);
  },
};
