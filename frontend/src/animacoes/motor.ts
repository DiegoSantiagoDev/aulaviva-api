import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * Registro único dos plugins: importe `gsap`, `ScrollTrigger` e `useGSAP` sempre daqui.
 * O arquivo NÃO se chama `gsap.ts` de propósito: um módulo local com o nome do pacote
 * deixa a resolução de `'gsap'` ambígua (TypeScript e Rollup).
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Celulares: a barra de endereço que some/aparece não deve recalcular a seção fixada.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };
