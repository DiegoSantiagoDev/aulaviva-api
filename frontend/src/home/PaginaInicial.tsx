import { useMemo, useRef, useState } from 'react';
import { LogIn, LogOut, ShieldCheck, GraduationCap } from 'lucide-react';
import { useRoteador } from '../app/Roteador.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import { gsap, ScrollTrigger, useGSAP } from '../animacoes/motor.ts';
import { DURACAO, EASE, dispositivoModesto, temPonteiroFino, webglDisponivel } from '../animacoes/movimento.ts';
import { useMovimentoReduzido } from '../animacoes/useMovimentoReduzido.ts';
import NucleoCSS from '../components/ui/NucleoCSS.tsx';
import CenaFundo from './CenaFundo.tsx';
import { calcularAlvo, estadoCena } from './estadoCena.ts';
import SecaoHero from './secoes/SecaoHero.tsx';
import SecaoHistoria from './secoes/SecaoHistoria.tsx';
import SecaoPortas from './secoes/SecaoPortas.tsx';
import SecaoRecursos from './secoes/SecaoRecursos.tsx';
import SecaoFim from './secoes/SecaoFim.tsx';
import './inicial.css';

/** Unidades da cena 3D por altura da tela (fov 36° a 7 de distância ≈ 4,55 unidades). */
const UNIDADES_POR_ALTURA = 4.55;

export default function PaginaInicial() {
  const { navegar } = useRoteador();
  const { sessao, sair } = useAuth();
  const raiz = useRef<HTMLDivElement>(null);
  const reduzido = useMovimentoReduzido();

  const [falhou3d, setFalhou3d] = useState(false);
  const [pronta, setPronta] = useState(false);
  const pode3d = useMemo(
    () => !reduzido && webglDisponivel() && !document.documentElement.classList.contains('modo-leve'),
    [reduzido]
  );
  const leve = useMemo(() => dispositivoModesto(), []);
  const em3d = pode3d && !falhou3d;

  useGSAP(
    () => {
      // Sempre parte do início da jornada (o estado é um objeto de módulo e sobrevive à troca de rota).
      estadoCena.hero = estadoCena.historia = estadoCena.meio = estadoCena.fim = 0;
      estadoCena.mx = estadoCena.my = 0;
      if (reduzido) return;

      const limpar: Array<() => void> = [];
      const atualizarLargura = () => {
        estadoCena.larga = window.innerWidth >= 900;
      };
      atualizarLargura();
      window.addEventListener('resize', atualizarLargura);
      limpar.push(() => window.removeEventListener('resize', atualizarLargura));

      /* ---------- Abertura: título revelado linha a linha + palco que acende ---------- */
      const abertura = gsap.timeline({ defaults: { ease: EASE.acender } });
      abertura
        .fromTo('.inicio-palco-in', { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 2.4 }, 0)
        .from('.inicio-topo > *', { y: -20, autoAlpha: 0, duration: DURACAO.cena, stagger: 0.08 }, 0.2)
        .from('.h-linha', { yPercent: 118, duration: DURACAO.epico, stagger: 0.11 }, 0.35)
        .from('.h-fade', { y: 24, autoAlpha: 0, duration: DURACAO.cena, stagger: 0.1 }, 1.0);

      /* ---------- Jornada: cada fase alimenta a câmera e a luz do núcleo ---------- */
      const fase = (chave: 'hero' | 'meio' | 'fim', gatilho: string, inicio: string, fimPos: string) =>
        ScrollTrigger.create({
          trigger: gatilho,
          start: inicio,
          end: fimPos,
          onUpdate: (self: ScrollTrigger) => {
            estadoCena[chave] = self.progress;
            aplicarPalco();
          },
        });

      const definirOpacidade = gsap.quickSetter('.inicio-palco', 'opacity');
      const aplicarPalco = () => {
        // Recua durante "portas" e "recursos" para dar lugar ao texto e volta no final.
        definirOpacidade(1 - 0.62 * estadoCena.meio * (1 - estadoCena.fim));
      };

      // Ordem importa: os gatilhos são criados na ordem em que aparecem na página,
      // e os que vêm depois da seção fixada precisam nascer depois dela.
      fase('hero', '.inicio-hero', 'top top', 'bottom top');

      gsap.to('.hero-conteudo', {
        yPercent: -14,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.inicio-hero', start: 'top top', end: 'bottom 35%', scrub: true },
      });

      ScrollTrigger.create({
        trigger: '.inicio-hero',
        start: 'top -60',
        end: 'max',
        toggleClass: { targets: '.inicio-topo', className: 'inicio-topo--rolado' },
      });

      /* ---------- Seção fixada: três cenas coreografadas pelo scroll ---------- */
      const passos = gsap.utils.toArray<HTMLElement>('.hist-passo');
      const marcarPasso = (p: number) => {
        const ativo = p < 0.3 ? 0 : p < 0.64 ? 1 : 2;
        passos.forEach((el: HTMLElement, i: number) => el.toggleAttribute('data-ativo', i === ativo));
      };
      marcarPasso(0);

      gsap.set('.hist-cena-2, .hist-cena-3', { autoAlpha: 0 });
      const historia = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.inicio-historia',
          start: 'top top',
          end: '+=320%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self: ScrollTrigger) => {
            estadoCena.historia = self.progress;
            marcarPasso(self.progress);
          },
          onLeaveBack: () => {
            estadoCena.historia = 0;
          },
        },
      });

      historia
        .to('.hist-fio-preenche', { scaleY: 1, ease: 'none', duration: 3 }, 0)
        // cena 1 → 2
        .to('.hist-cena-1 .hist-bloco', { y: -70, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.8)
        .to('.hist-numeros', { x: () => -window.innerWidth, duration: 0.45, ease: 'power3.inOut' }, 0.8)
        .set('.hist-cena-2', { autoAlpha: 1 }, 1.0)
        .from('.hist-cena-2 .hist-linha', { yPercent: 118, duration: 0.4, stagger: 0.07 }, 1.0)
        .from('.hist-cena-2 .hist-fade', { y: 34, autoAlpha: 0, duration: 0.4, stagger: 0.08 }, 1.12)
        // cena 2 → 3
        .to('.hist-cena-2 .hist-bloco', { y: -70, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 1.8)
        .to('.hist-numeros', { x: () => -2 * window.innerWidth, duration: 0.45, ease: 'power3.inOut' }, 1.8)
        .set('.hist-cena-3', { autoAlpha: 1 }, 2.0)
        .from('.hist-cena-3 .hist-linha', { yPercent: 118, duration: 0.4, stagger: 0.07 }, 2.0)
        .from('.hist-cena-3 .hist-fade', { y: 34, autoAlpha: 0, duration: 0.4, stagger: 0.08 }, 2.12)
        .from('.hist-quadros span', { scale: 0.7, autoAlpha: 0, duration: 0.4, stagger: 0.1, ease: EASE.mola }, 2.25)
        .to({}, { duration: 0.5 }, 2.5);

      fase('meio', '.inicio-meio', 'top 85%', 'bottom 70%');
      fase('fim', '.inicio-fim', 'top 90%', 'bottom bottom');

      /* ---------- Revelações no scroll (portas, recursos, final) ---------- */
      gsap.set('.rev', { autoAlpha: 0, y: 36 });
      gsap.set('.rev-linha', { yPercent: 118 });
      gsap.set('.rev-clip', { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });

      ScrollTrigger.batch('.rev', {
        start: 'top 88%',
        once: true,
        onEnter: (els: Element[]) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: EASE.acender, stagger: 0.1, overwrite: true }),
      });
      ScrollTrigger.batch('.rev-linha', {
        start: 'top 92%',
        once: true,
        onEnter: (els: Element[]) => gsap.to(els, { yPercent: 0, duration: DURACAO.epico, ease: EASE.acender, stagger: 0.1, overwrite: true }),
      });
      ScrollTrigger.batch('.rev-clip', {
        start: 'top 85%',
        once: true,
        onEnter: (els: Element[]) =>
          gsap.to(els, { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.out', stagger: 0.18, overwrite: true }),
      });

      gsap.to('.marq-a', {
        xPercent: -32,
        ease: 'none',
        scrollTrigger: { trigger: '.ini-marquee', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
      gsap.fromTo(
        '.marq-b',
        { xPercent: -32 },
        { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ini-marquee', start: 'top bottom', end: 'bottom top', scrub: 0.6 } }
      );

      /* ---------- Ponteiro: luz que segue o cursor e parallax do núcleo ---------- */
      if (temPonteiroFino()) {
        const luzX = gsap.quickTo('.inicio-luz', 'x', { duration: 0.9, ease: 'power3.out' });
        const luzY = gsap.quickTo('.inicio-luz', 'y', { duration: 0.9, ease: 'power3.out' });
        const mover = (e: PointerEvent) => {
          luzX(e.clientX);
          luzY(e.clientY);
          estadoCena.mx = (e.clientX / window.innerWidth) * 2 - 1;
          estadoCena.my = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('pointermove', mover);
        limpar.push(() => window.removeEventListener('pointermove', mover));
      }

      /* ---------- Alternativa sem WebGL: o núcleo em CSS segue a mesma jornada ---------- */
      if (!em3d) {
        const s = { x: 0, y: 0, escala: 0.9 };
        const acompanhar = () => {
          const alvo = calcularAlvo(estadoCena);
          const u = window.innerHeight / UNIDADES_POR_ALTURA;
          s.x += (alvo.x - s.x) * 0.08;
          s.y += (alvo.y - s.y) * 0.08;
          s.escala += (alvo.escala - s.escala) * 0.08;
          gsap.set('.inicio-palco-css', { x: s.x * u, y: -s.y * u, scale: s.escala });
        };
        gsap.ticker.add(acompanhar);
        limpar.push(() => gsap.ticker.remove(acompanhar));
      }

      return () => limpar.forEach((fn: () => void) => fn());
    },
    { scope: raiz, dependencies: [reduzido, em3d], revertOnUpdate: true }
  );

  const irPara = (rota: string) => navegar(rota);

  return (
    <div ref={raiz} className={`inicio ${reduzido ? 'inicio--estatico' : ''}`}>
      <div className="inicio-palco" aria-hidden="true">
        <div className="inicio-palco-in">
          {em3d ? (
            <div className={`inicio-cena ${pronta ? 'inicio-cena--pronta' : ''}`}>
              <CenaFundo leve={leve} aoPronta={() => setPronta(true)} aoFalhar={() => setFalhou3d(true)} />
            </div>
          ) : (
            <div className="inicio-palco-css">
              <NucleoCSS />
            </div>
          )}
        </div>
        <div className="inicio-vinheta" />
      </div>
      <div className="inicio-luz" aria-hidden="true" />

      <a href="#conteudo" className="av-pular" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>
        Pular para o conteúdo
      </a>

      <header className="inicio-topo">
        <button type="button" className="av-marca" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Aula Viva — início da página">
          <span className="av-marca-nucleo" aria-hidden="true" />
          <span className="av-marca-nome">Aula Viva</span>
        </button>
        <nav className="inicio-topo-nav" aria-label="Principal">
          <button type="button" className="inicio-link" onClick={() => irPara('/aulas')}>
            Biblioteca
          </button>
          {sessao ? (
            <>
              <button type="button" className="inicio-link inicio-link-forte" onClick={() => irPara(sessao.papel === 'ADMIN' ? '/admin' : '/professor')}>
                {sessao.papel === 'ADMIN' ? <ShieldCheck className="w-4 h-4" aria-hidden="true" /> : <GraduationCap className="w-4 h-4" aria-hidden="true" />}
                <span>{sessao.papel === 'ADMIN' ? 'Administração' : 'Meu painel'}</span>
              </button>
              <button type="button" className="inicio-link" onClick={sair} aria-label="Sair da conta">
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button type="button" className="inicio-link inicio-link-forte" onClick={() => irPara('/entrar')}>
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Entrar</span>
            </button>
          )}
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1} className="outline-none">
        <SecaoHero irPara={irPara} />
        <SecaoHistoria />
        <div className="inicio-meio">
          <SecaoPortas irPara={irPara} />
          <SecaoRecursos />
        </div>
        <SecaoFim irPara={irPara} />
      </main>
    </div>
  );
}
