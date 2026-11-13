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
  /** Campo planejado para visibilidade */
  hidden?: boolean;
  /** Campo planejado para indicar se possui slides */
  hasSlides?: boolean;
  /** Campo planejado para indicar se possui fotos do quadro */
  hasImages?: boolean;
}

export interface LessonResponse {
  id: number;
  title: string;
  subject: string;
  status: LessonStatus;
  hasAudio: boolean;
  summary: string | null;
  /**
   * Hoje só o modo de exemplo (`?mock=1`) fornece este campo.
   * O back-end real ainda não gera slides; quando ausente, a UI mostra
   * uma mensagem honesta de indisponibilidade.
   */
  presentation?: SlidePresentation | null;
  failureReason: string | null;
  images: ImageResponse[];
  createdAt: string;
  /** Campo planejado para visibilidade */
  hidden?: boolean;
  /** Campo planejado para indicar se possui slides */
  hasSlides?: boolean;
}

export interface CreateLessonRequest {
  title: string;
  subject: string;
}

export interface PromptDetail {
  version?: string;
  model?: string;
  generatedAt?: string;
  text: string;
}

export interface PromptsResponse {
  summary: PromptDetail;
  slides: PromptDetail | null;
  video: {
    text: string;
  };
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}
