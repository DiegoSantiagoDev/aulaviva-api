import { useRef } from 'react';
import { gsap, useGSAP } from './motor.ts';
import { prefereMovimentoReduzido, temPonteiroFino } from './movimento.ts';

/**
 * Inclinação 3D moderada de um cartão que segue o ponteiro.
 * Só em mouse e sem "movimento reduzido"; teclado e toque não dependem dela.
 */
export function useInclinacao<T extends HTMLElement>(intensidade = 6) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefereMovimentoReduzido() || !temPonteiroFino()) return;

      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      gsap.set(el, { transformPerspective: 900 });

      const mover = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ry(x * intensidade);
        rx(-y * intensidade);
      };
      const sair = () => {
        rx(0);
        ry(0);
      };
      el.addEventListener('pointermove', mover);
      el.addEventListener('pointerleave', sair);
      return () => {
        el.removeEventListener('pointermove', mover);
        el.removeEventListener('pointerleave', sair);
      };
    },
    { scope: ref }
  );

  return ref;
}
