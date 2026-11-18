/**
 * Estado compartilhado entre o scroll (GSAP/ScrollTrigger) e a cena 3D (R3F).
 * É um objeto mutável de propósito: o scroll escreve, o loop de render lê a cada
 * quadro — sem passar por estado do React, que provocaria re-renderizações.
 *
 * Cada fase vai de 0 a 1 e fica em 1 depois de concluída:
 *  hero → historia (seção fixada) → meio (portas e recursos) → fim (chamada final)
 */
export const estadoCena = {
  hero: 0,
  historia: 0,
  meio: 0,
  fim: 0,
  /** Ponteiro normalizado de -1 a 1. */
  mx: 0,
  my: 0,
  /** Em telas largas o núcleo fica à direita do título; em estreitas, centralizado. */
  larga: true,
};

export interface AlvoNucleo {
  x: number;
  y: number;
  escala: number;
}

/** Onde o núcleo deve estar, em unidades de cena, dado o ponto da jornada. */
export function calcularAlvo(e: typeof estadoCena): AlvoNucleo {
  const base = e.larga ? 2.1 : 0;
  const lado = e.larga ? 3.1 : 0;
  return {
    x: base * (1 - e.hero) + lado * e.meio * (1 - e.fim),
    y: (e.larga ? 1.0 : 1.6) * e.meio * (1 - e.fim) - 2.9 * e.fim + (e.larga ? 0 : 0.9 * (1 - e.hero)),
    escala: 0.9 + 0.1 * e.hero + 0.9 * e.historia - 1.2 * e.meio + 2.7 * e.fim,
  };
}
