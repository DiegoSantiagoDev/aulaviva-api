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
    try {
      return await requisicaoJson<LessonListItem[]>('/api/lessons');
    } catch (err) {
      // Fallback gracioso para mock se o backend não estiver rodando
      const apiErr = normalizarErro(err, 'Erro ao carregar aulas.');
      if (apiErr.status === 0 || apiErr.status === 404) {
        console.warn('Backend indisponível, utilizando dados de demonstração (mock).');
        return mockApi.listarAulas();
      }
      throw apiErr;
    }
  },

  /**
   * Obtém detalhes de uma aula específica
   */
  obterAula: async (id: number): Promise<LessonResponse> => {
    if (recursos.usarMock) return mockApi.obterAula(id);
    try {
      return await requisicaoJson<LessonResponse>(`/api/lessons/${id}`);
    } catch (err) {
      const apiErr = normalizarErro(err, 'Erro ao carregar aula.');
      if (apiErr.status === 0) {
        return mockApi.obterAula(id);
      }
      throw apiErr;
    }
  },

  /**
   * Cadastra uma nova aula (professor)
   */
  criarAula: async (dados: CreateLessonRequest): Promise<LessonResponse> => {
    if (recursos.usarMock) return mockApi.criarAula(dados);
    try {
      return await requisicaoJson<LessonResponse>('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
    } catch (err) {
      const apiErr = normalizarErro(err, 'Erro ao criar aula.');
      if (apiErr.status === 0) return mockApi.criarAula(dados);
      throw apiErr;
    }
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
        // Se a API estiver offline em dev, simular com mock
        console.warn('Upload real falhou, simulando via mock.');
        mockApi.enviarAudio(id, arquivo, noProgresso).then(resolve).catch(reject);
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
    try {
      return await requisicaoJson<LessonResponse>(`/api/lessons/${id}/reprocess`, {
        method: 'POST',
      });
    } catch (err) {
      const apiErr = normalizarErro(err, 'Erro ao reprocessar aula.');
      if (apiErr.status === 0) return mockApi.reprocessar(id);
      throw apiErr;
    }
  },

  /**
   * Envia uma foto do quadro
   */
  enviarImagem: async (id: number, arquivo: File): Promise<ImageResponse> => {
    if (recursos.usarMock) return mockApi.enviarImagem(id, arquivo);
    try {
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
          // Nada
        }
        throw { status: res.status, message: msg } as ApiError;
      }

      return (await res.json()) as ImageResponse;
    } catch (err) {
      const apiErr = normalizarErro(err, 'Falha no envio da imagem.');
      if (apiErr.status === 0) return mockApi.enviarImagem(id, arquivo);
      throw apiErr;
    }
  },

  /**
   * Obtém os prompts usados para gerar o conteúdo (Como foi gerado)
   */
  obterPrompts: async (id: number): Promise<PromptsResponse> => {
    if (recursos.usarMock) return mockApi.obterPrompts(id);
    try {
      return await requisicaoJson<PromptsResponse>(`/api/lessons/${id}/prompts`);
    } catch (err) {
      // Endpoint planejado: se 404 ou 0, trata com dados do mock
      const apiErr = normalizarErro(err, 'Prompts não disponíveis.');
      if (apiErr.status === 404 || apiErr.status === 0) {
        return mockApi.obterPrompts(id);
      }
      throw apiErr;
    }
  },
};
