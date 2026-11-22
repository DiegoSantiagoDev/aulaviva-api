/**
 * Estado compartilhado entre o scroll (GSAP/ScrollTrigger) e a cena 3D (R3F).
 * São objetos mutáveis de propósito: o scroll escreve, o loop de render lê a cada
 * quadro — sem passar por estado do React, que provocaria re-renderizações.
 *
 * Cada fase vai de 0 a 1 e fica em 1 depois de concluída:
 *  hero (transição sol → gosma, hero fixado por ~1,9 telas) → historia (seção fixada)
 *  → meio (portas e recursos) → fim (chamada final)
 *
 * UMA fonte de suavização da cena:
 *  - o ScrollTrigger escreve o progresso BRUTO em `brutoCena` (sem atraso);
 *  - `suavizarCena` (chamada uma vez por quadro, no gsap.ticker) aproxima `estadoCena` do bruto
 *    com amortecimento exponencial independente da taxa de quadros;
 *  - a cena 3D só LÊ `estadoCena`; nenhum objeto da cena aplica um segundo amortecimento ao scroll.
 */

/** Constantes de suavização num só lugar. */
export const SUAVIZACAO = {
  /** Cena 3D: quanto maior, mais colado ao scroll (constante de tempo ≈ 1/valor segundos). */
  cena: 7,
  /** Textos e camadas do DOM presos ao scroll (scrub do ScrollTrigger, em segundos). */
  dom: 0.35,
} as const;

export interface FasesCena {
  hero: number;
  historia: number;
  meio: number;
  fim: number;
}

/** Progresso real do scroll (escrito pelos ScrollTriggers). */
export const brutoCena: FasesCena = { hero: 0, historia: 0, meio: 0, fim: 0 };

export const estadoCena = {
  /** Progresso já suavizado (a cena lê estes). */
  hero: 0,
  historia: 0,
  meio: 0,
  fim: 0,
  /** Ponteiro normalizado de -1 a 1. */
  mx: 0,
  my: 0,
  /** Ponteiro já suavizado (a cena escreve, todos os objetos leem). Volta a 0 quando o núcleo fica atrás do texto. */
  mxs: 0,
  mys: 0,
  /** Em telas largas o núcleo fica à direita do título; em estreitas, centralizado. */
  larga: true,
};

const CHAVES: ReadonlyArray<keyof FasesCena> = ['hero', 'historia', 'meio', 'fim'];

/** Aproxima o estado suavizado do bruto. `dt` em segundos. */
export function suavizarCena(dt: number): void {
  const passo = 1 - Math.exp(-SUAVIZACAO.cena * Math.min(dt, 0.05));
  for (const k of CHAVES) {
    const d = brutoCena[k] - estadoCena[k];
    // Salto grande (link para uma seção, recarregar no meio da página): vai direto ao destino em vez de
    // "viajar" por toda a transição (explosão, enxame...) diante do usuário.
    estadoCena[k] = Math.abs(d) < 0.0004 || Math.abs(d) > 0.3 ? brutoCena[k] : estadoCena[k] + d * passo;
  }
}

/** Copia o bruto para o suavizado (início, retorno de rota, resize): sem "viagem" de 0 até o ponto atual. */
export function sincronizarCena(): void {
  for (const k of CHAVES) estadoCena[k] = brutoCena[k];
}

export function zerarCena(): void {
  for (const k of CHAVES) brutoCena[k] = estadoCena[k] = 0;
  estadoCena.mx = estadoCena.my = estadoCena.mxs = estadoCena.mys = 0;
}

export interface AlvoNucleo {
  x: number;
  y: number;
  escala: number;
}

/** smoothstep sem depender do three (este arquivo também serve ao fallback em CSS). */
export function rampa(v: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Onde o núcleo deve estar, em unidades de cena, dado o ponto da jornada.
 * Sem amortecimento próprio: o progresso que entra já é o suavizado.
 */
export function calcularAlvo(e: typeof estadoCena, saida: AlvoNucleo = { x: 0, y: 0, escala: 1 }): AlvoNucleo {
  const h = rampa(e.hero, 0, 1);
  const base = e.larga ? 2.0 : 0;
  const lado = e.larga ? 3.1 : 0;
  // Na história a gosma fica um pouco à direita (não esconde o texto da esquerda); no meio vai para o lado.
  // Na história a gosma sai da frente do texto: à direita nas cenas 1 e 3 (texto à esquerda), à esquerda na 2.
  const cena2 = rampa(e.historia, 0.26, 0.34) * (1 - rampa(e.historia, 0.6, 0.68));
  const naHistoria = e.larga ? rampa(e.historia, 0, 0.12) * (1 - e.meio) : 0;
  saida.x = base * (1 - h) + naHistoria * (1.4 - 3.0 * cena2) + lado * e.meio * (1 - e.fim);
  saida.y =
    (e.larga ? 1.0 : 1.6) * e.meio * (1 - e.fim) - 2.9 * e.fim + (e.larga ? 0 : 1.45 * (1 - h));
  saida.escala = 0.9 + 0.1 * e.hero + 0.6 * e.historia - 0.9 * e.meio + 2.7 * e.fim;
  return saida;
}
