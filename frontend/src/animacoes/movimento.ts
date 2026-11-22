/**
 * Linguagem de movimento do Aula Viva.
 * Três ritmos, sempre com a mesma curva de "acender": começa rápido e assenta devagar.
 *  - brilho: 0.35 s — respostas de interface (hover, foco, botões)
 *  - cena:   0.9 s  — entradas de bloco e troca de tela
 *  - epico:  1.6 s  — aberturas e revelações de títulos
 */
export const EASE = {
  acender: 'expo.out',
  suave: 'power3.out',
  entrada: 'power3.inOut',
  mola: 'back.out(1.6)',
} as const;

export const DURACAO = {
  brilho: 0.35,
  cena: 0.9,
  epico: 1.6,
} as const;

export function prefereMovimentoReduzido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Ponteiro fino (mouse): efeitos magnéticos e de inclinação só fazem sentido aqui. */
export function temPonteiroFino(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Aparelho realmente modesto: pouca memória/CPU declaradas OU celular (tela estreita + toque).
 * Notebooks comuns de 4 núcleos NÃO entram aqui: a qualidade só cai depois, de forma adaptativa,
 * se o fps medido ficar abaixo de ~50 (PerformanceMonitor na cena).
 */
export function dispositivoModesto(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const poucosNucleos = (nav.hardwareConcurrency ?? 8) <= 2;
  const pouca = (nav.deviceMemory ?? 8) <= 2;
  const celular =
    typeof window !== 'undefined' &&
    window.innerWidth < 768 &&
    window.matchMedia('(pointer: coarse)').matches;
  return poucosNucleos || pouca || celular;
}

export function webglDisponivel(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
