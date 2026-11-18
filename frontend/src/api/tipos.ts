/**
 * Tipos e contratos de dados da API do AulaViva
 */

export type LessonStatus = 'CREATED' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface ImageResponse {
  id: number;
  originalName: string;
  url: string;
}

/** Layouts visuais efetivamente renderizados pelo visualizador. */
export type SlideLayout =
  | 'capa'
  | 'conteudo'
  | 'definicao'
  | 'exemplo'
  | 'formula'
  | 'duas-colunas'
  | 'revisao'
  | 'perguntas';

export interface SlideItem {
  title: string;
  /**
   * Layout bruto vindo da IA. Pode ser qualquer texto; a heurística em
   * `features/slides/heuristicaLayout.ts` valida e escolhe o layout final.
   */
  layout?: string;
  content: string[];
}

export interface SlidePresentation {
  title: string;
  slides: SlideItem[];
}

export interface LessonListItem {
  id: number;
  title: string;
  subject: string;
  status: LessonStatus;
  createdAt: string;
  /** Enviado pelo backend: a aula tem apresentação de slides gerada. */
  hasSlides: boolean;
  /** Enviado pelo backend: a aula tem fotos do quadro. */
  hasImages: boolean;
}

export interface LessonResponse {
  id: number;
  title: string;
  subject: string;
  status: LessonStatus;
  hasAudio: boolean;
  summary: string | null;
  /** Apresentação gerada pelo backend; `null` enquanto não houver slides. */
  presentation: SlidePresentation | null;
  failureReason: string | null;
  images: ImageResponse[];
  createdAt: string;
}

export interface CreateLessonRequest {
  title: string;
  subject: string;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}

/* ---------------------------------------------------------------------
   Autenticação e administração (contratos do backend, branch feature/auth)
   --------------------------------------------------------------------- */

/** Papéis do backend. O aluno é só o visitante anônimo: não há login de ALUNO. */
export type Papel = 'ADMIN' | 'PROFESSOR' | 'ALUNO';

export type StatusConta = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  /** Instante ISO-8601 em que o JWT expira (8 h por padrão no backend). */
  expiresAt: string;
  name: string;
  role: Papel;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: Papel;
  status: StatusConta;
  createdAt: string;
}
