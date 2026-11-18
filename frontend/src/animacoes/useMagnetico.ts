import { useRef } from 'react';
import { gsap, useGSAP } from './motor.ts';
import { prefereMovimentoReduzido, temPonteiroFino } from './movimento.ts';

/** Botão "magnético": o elemento é atraído levemente pelo cursor, com limite suave. */
export function useMagnetico<T extends HTMLElement>(forca = 0.25, limite = 14) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefereMovimentoReduzido() || !temPonteiroFino()) return;
      const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      const clamp = gsap.utils.clamp(-limite, limite);

      const mover = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x(clamp((e.clientX - (r.left + r.width / 2)) * forca));
        y(clamp((e.clientY - (r.top + r.height / 2)) * forca));
      };
      const sair = () => {
        x(0);
        y(0);
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
