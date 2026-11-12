/**
 * Tipos e contratos de dados da API do AulaViva
 */

export type LessonStatus = 'CREATED' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface ImageResponse {
  id: number;
  originalName: string;
  url: string;
}

export type SlideLayout =
  | 'capa'
  | 'conteudo'
  | 'definicao'
  | 'exemplo'
  | 'formula'
  | 'duas-colunas'
  | 'revisao'
  | 'perguntas'
  | string;

export interface SlideItem {
  title: string;
  layout?: SlideLayout;
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
  /** Campo de apoio para indicar se possui slides */
  hasSlides?: boolean;
}

export interface LessonResponse {
  id: number;
  title: string;
  subject: string;
  status: LessonStatus;
  hasAudio: boolean;
  summary: string | null;
  presentation?: SlidePresentation | null;
  failureReason: string | null;
  images: ImageResponse[];
  createdAt: string;
  /** Campo planejado para visibilidade */
  hidden?: boolean;
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
