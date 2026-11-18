import { useRef, type ReactNode } from 'react';
import { useRoteador } from '../app/Roteador.tsx';
import { gsap, useGSAP } from './motor.ts';
import { DURACAO, EASE, prefereMovimentoReduzido } from './movimento.ts';

/**
 * Transição entre telas: uma linha de brasa varre o topo e o conteúdo "acende".
 * Em movimento reduzido nada se move: o conteúdo aparece direto.
 */
export default function TransicaoRota({ children }: { children: ReactNode }) {
  const { rota } = useRoteador();
  const raiz = useRef<HTMLDivElement>(null);
  const linha = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  useGSAP(
    () => {
      if (primeira.current) {
        primeira.current = false;
        return;
      }
      if (prefereMovimentoReduzido()) return;
      const tl = gsap.timeline();
      tl.fromTo(
        linha.current,
        { scaleX: 0, transformOrigin: '0% 50%', autoAlpha: 1 },
        { scaleX: 1, duration: 0.55, ease: EASE.entrada }
      )
        .to(linha.current, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: EASE.entrada }, '>')
        // Só opacidade: um transform no ancestral quebraria o `position: fixed` da cena 3D e o pin do ScrollTrigger.
        .fromTo(
          raiz.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: DURACAO.cena, ease: EASE.suave, clearProps: 'opacity,visibility' },
          0.15
        );
    },
    { dependencies: [rota], scope: raiz, revertOnUpdate: true }
  );

  return (
    <>
      <div ref={linha} className="av-transicao-linha" aria-hidden="true" />
      <div ref={raiz}>{children}</div>
    </>
  );
}
