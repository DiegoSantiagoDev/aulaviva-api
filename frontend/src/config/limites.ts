/**
 * Limites definidos pelo backend (LessonService e application.properties).
 * Se o backend mudar, ajuste aqui: a interface só antecipa a regra,
 * quem decide é sempre o servidor.
 */
export const MAX_FOTOS_POR_AULA = 3;
export const LIMITE_AUDIO_BYTES = 25 * 1024 * 1024;
/** Extensões aceitas pelo backend (MediaKind). */
export const EXTENSOES_AUDIO = ['mp3', 'wav', 'm4a', 'ogg', 'webm'] as const;
export const EXTENSOES_IMAGEM = ['jpg', 'jpeg', 'png', 'webp'] as const;
