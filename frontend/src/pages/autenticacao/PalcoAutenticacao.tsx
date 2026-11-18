import { useRef, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRoteador } from '../../app/Roteador.tsx';
import { gsap, useGSAP } from '../../animacoes/motor.ts';
import { DURACAO, EASE, prefereMovimentoReduzido, temPonteiroFino } from '../../animacoes/movimento.ts';
import NucleoCSS from '../../components/ui/NucleoCSS.tsx';
import './autenticacao.css';

interface PalcoAutenticacaoProps {
  /** Texto pequeno em caixa alta acima do título do painel de cena. */
  etiqueta: string;
  /** Frase do painel de cena (lado esquerdo). */
  chamada: ReactNode;
  children: ReactNode;
}

/**
 * Moldura das telas de acesso: à esquerda a cena (núcleo + frase), à direita o formulário.
 * Intro coreografada com GSAP; o núcleo reage levemente ao mouse.
 */
export default function PalcoAutenticacao({ etiqueta, chamada, children }: PalcoAutenticacaoProps) {
  const { navegar } = useRoteador();
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefereMovimentoReduzido()) return;
      const tl = gsap.timeline({ defaults: { ease: EASE.acender } });
      tl.from('.av-aut-nucleo', { scale: 0.55, autoAlpha: 0, duration: DURACAO.epico })
        .from('.av-aut-linha', { yPercent: 110, duration: DURACAO.cena, stagger: 0.12 }, 0.2)
        .from('.av-aut-entra', { y: 24, autoAlpha: 0, duration: DURACAO.cena, stagger: 0.08 }, 0.35);

      if (temPonteiroFino()) {
        const x = gsap.quickTo('.av-aut-nucleo', 'x', { duration: 1.2, ease: 'power3.out' });
        const y = gsap.quickTo('.av-aut-nucleo', 'y', { duration: 1.2, ease: 'power3.out' });
        const mover = (e: PointerEvent) => {
          x((e.clientX / window.innerWidth - 0.5) * 36);
          y((e.clientY / window.innerHeight - 0.5) * 26);
        };
        window.addEventListener('pointermove', mover);
        return () => window.removeEventListener('pointermove', mover);
      }
    },
    { scope: raiz }
  );

  return (
    <div ref={raiz} className="av-aut">
      <aside className="av-aut-cena" aria-hidden={false}>
        <button type="button" className="av-aut-voltar av-aut-entra" onClick={() => navegar('/')}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Aula Viva</span>
        </button>
        <div className="av-aut-nucleo">
          <NucleoCSS />
        </div>
        <div className="av-aut-texto">
          <p className="av-rotulo av-aut-entra">{etiqueta}</p>
          <p className="av-aut-chamada">{chamada}</p>
        </div>
      </aside>
      <main id="conteudo" className="av-aut-painel">
        <div className="av-aut-cartao">{children}</div>
      </main>
    </div>
  );
}

/** Uma linha do título com máscara, para a revelação deslizante. */
export function LinhaTitulo({ children }: { children: ReactNode }) {
  return (
    <span className="av-aut-mascara">
      <span className="av-aut-linha">{children}</span>
    </span>
  );
}
