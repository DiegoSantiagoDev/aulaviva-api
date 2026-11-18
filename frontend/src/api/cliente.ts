import { requisicao, mensagemDoCorpo } from './http.ts';
import { encerrarSessao, obterToken } from '../auth/sessao.ts';
import {
  ApiError,
  CreateLessonRequest,
  ImageResponse,
  LessonListItem,
  LessonResponse,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  StatusConta,
  UserSummary,
} from './tipos.ts';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Cliente da API do Aula Viva. Todas as rotas existem no backend
 * (branch feature/auth); nada aqui é simulado.
 */
export const api = {
  // ---------------------------------------------------------------- autenticação
  /** POST /api/auth/login — público. 401: credenciais; 403: conta pendente ou rejeitada. */
  entrar: (dados: LoginRequest): Promise<LoginResponse> =>
    requisicao<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
      semToken: true,
    }),

  /** POST /api/auth/register — público. Sempre cria PROFESSOR com status PENDING. */
  cadastrar: (dados: RegisterRequest): Promise<MessageResponse> =>
    requisicao<MessageResponse>('/api/auth/register', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
      semToken: true,
    }),

  // ---------------------------------------------------------------- administração (ADMIN)
  /** GET /api/admin/users?status= — lista apenas professores. */
  listarProfessores: (status: StatusConta): Promise<UserSummary[]> =>
    requisicao<UserSummary[]>(`/api/admin/users?status=${encodeURIComponent(status)}`),

  aprovarProfessor: (id: number): Promise<UserSummary> =>
    requisicao<UserSummary>(`/api/admin/users/${id}/approve`, { method: 'POST' }),

  rejeitarProfessor: (id: number): Promise<UserSummary> =>
    requisicao<UserSummary>(`/api/admin/users/${id}/reject`, { method: 'POST' }),

  // ---------------------------------------------------------------- aulas
  /** GET /api/lessons — público vê só DONE; professor e admin veem todas. */
  listarAulas: (): Promise<LessonListItem[]> => requisicao<LessonListItem[]>('/api/lessons'),

  obterAula: (id: number): Promise<LessonResponse> => requisicao<LessonResponse>(`/api/lessons/${id}`),

  criarAula: (dados: CreateLessonRequest): Promise<LessonResponse> =>
    requisicao<LessonResponse>('/api/lessons', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(dados),
    }),

  /** DELETE /api/lessons/{id} — 409 enquanto a aula está em PROCESSING. */
  excluirAula: (id: number): Promise<void> => requisicao<void>(`/api/lessons/${id}`, { method: 'DELETE' }),

  reprocessar: (id: number): Promise<LessonResponse> =>
    requisicao<LessonResponse>(`/api/lessons/${id}/reprocess`, { method: 'POST' }),

  /**
   * POST /api/lessons/{id}/audio (multipart, resposta 202).
   * Usa XMLHttpRequest para ter progresso real de envio.
   */
  enviarAudio: (
    id: number,
    arquivo: File,
    noProgresso?: (porcentagem: number) => void
  ): Promise<LessonResponse> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/lessons/${id}/audio`, true);
      xhr.setRequestHeader('Accept', 'application/json');
      const token = obterToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (noProgresso) {
        xhr.upload.onprogress = (evento) => {
          if (evento.lengthComputable) noProgresso(Math.round((evento.loaded / evento.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as LessonResponse);
          } catch {
            reject({ status: xhr.status, message: 'Resposta inesperada do servidor.' } as ApiError);
          }
          return;
        }
        if (xhr.status === 401 && token) encerrarSessao('expirada');
        reject({
          status: xhr.status,
          message: mensagemDoCorpo(xhr.responseText, `Falha no envio (HTTP ${xhr.status})`),
        } as ApiError);
      };

      xhr.onerror = () =>
        reject({
          status: 0,
          message: 'Não foi possível enviar o áudio. Verifique a conexão e tente novamente.',
        } as ApiError);

      const formData = new FormData();
      formData.append('file', arquivo);
      xhr.send(formData);
    }),

  /** POST /api/lessons/{id}/images (multipart). Máximo de 3 por aula; 409 acima disso ou em PROCESSING. */
  enviarImagem: (id: number, arquivo: File): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', arquivo);
    return requisicao<ImageResponse>(`/api/lessons/${id}/images`, { method: 'POST', body: formData });
  },

  /** DELETE /api/lessons/{id}/images/{imageId} — o backend apaga também o arquivo. */
  excluirImagem: (id: number, imagemId: number): Promise<void> =>
    requisicao<void>(`/api/lessons/${id}/images/${imagemId}`, { method: 'DELETE' }),
};
