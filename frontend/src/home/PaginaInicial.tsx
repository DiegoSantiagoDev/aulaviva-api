import { useMemo, useRef, useState } from 'react';
import { LogIn, LogOut, ShieldCheck, GraduationCap } from 'lucide-react';
import { useRoteador } from '../app/Roteador.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import { gsap, ScrollTrigger, useGSAP } from '../animacoes/motor.ts';
import { DURACAO, EASE, dispositivoModesto, temPonteiroFino, webglDisponivel } from '../animacoes/movimento.ts';
import { useMovimentoReduzido } from '../animacoes/useMovimentoReduzido.ts';
import SolCanvas from '../components/ui/SolCanvas.tsx';
import CenaFundo from './CenaFundo.tsx';
import {
  SUAVIZACAO,
  brutoCena,
  calcularAlvo,
  estadoCena,
  rampa,
  sincronizarCena,
  suavizarCena,
  zerarCena,
  type AlvoNucleo,
} from './estadoCena.ts';
import { iniciarMedidorFps } from '../lib/medidorFps.ts';
import SecaoHero from './secoes/SecaoHero.tsx';
import SecaoHistoria from './secoes/SecaoHistoria.tsx';
import SecaoPortas from './secoes/SecaoPortas.tsx';
import SecaoRecursos from './secoes/SecaoRecursos.tsx';
import SecaoFim from './secoes/SecaoFim.tsx';
import './inicial.css';

/** Unidades da cena 3D por altura da tela (fov 36° a 7 de distância ≈ 4,55 unidades). */
const UNIDADES_POR_ALTURA = 4.55;

/** Altura de rolagem da transição sol → gosma, em alturas de tela (o hero fica fixado durante ela). */
const TELAS_DA_TRANSICAO = 2.8;

/** Até onde a transição pode ter avançado (0–1) para o núcleo ainda seguir o ponteiro. */
const LIMITE_INTERACAO = 0.06;

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
      zerarCena();
      if (reduzido) return;

      const limpar: Array<() => void> = [];
      const atualizarLargura = () => {
        estadoCena.larga = window.innerWidth >= 900;
      };
      atualizarLargura();
      window.addEventListener('resize', atualizarLargura);
      limpar.push(() => window.removeEventListener('resize', atualizarLargura));

      /* ---------- Relógio único: suaviza o scroll para a cena (e o ponteiro) uma vez por quadro ---------- */
      const suavizar = (_tempo: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 50) / 1000;
        suavizarCena(dt);
        const k = 1 - Math.exp(-2.5 * dt);
        estadoCena.mxs += (estadoCena.mx - estadoCena.mxs) * k;
        estadoCena.mys += (estadoCena.my - estadoCena.mys) * k;
      };
      gsap.ticker.add(suavizar);
      limpar.push(() => gsap.ticker.remove(suavizar));
      // Depois de cada recálculo (carregamento, resize) a cena assume o ponto atual sem "viajar" desde o zero.
      ScrollTrigger.addEventListener('refresh', sincronizarCena);
      limpar.push(() => ScrollTrigger.removeEventListener('refresh', sincronizarCena));
      limpar.push(iniciarMedidorFps(() => estadoCena.hero));

      /* ---------- Abertura: título revelado linha a linha + palco que acende ---------- */
      const abertura = gsap.timeline({ defaults: { ease: EASE.acender } });
      abertura
        .fromTo('.inicio-palco-in', { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 2.4 }, 0)
        .from('.inicio-topo > *', { y: -20, autoAlpha: 0, duration: DURACAO.cena, stagger: 0.08 }, 0.2)
        .from('.h-linha', { yPercent: 118, duration: DURACAO.epico, stagger: 0.11 }, 0.35)
        .from('.h-fade', { y: 24, autoAlpha: 0, duration: DURACAO.cena, stagger: 0.1 }, 1.0);

      /* ---------- Jornada: cada fase alimenta a câmera e a luz do núcleo ---------- */
      const fase = (chave: 'meio' | 'fim', gatilho: string, inicio: string, fimPos: string) =>
        ScrollTrigger.create({
          trigger: gatilho,
          start: inicio,
          end: fimPos,
          onUpdate: (self: ScrollTrigger) => {
            brutoCena[chave] = self.progress;
            aplicarPalco();
          },
        });

      const definirOpacidade = gsap.quickSetter('.inicio-palco', 'opacity');
      const definirSombra = gsap.quickSetter('.inicio-sombra', 'opacity');
      let definirLuz: ((v: number) => void) | null = null;
      // Só escreve no DOM quando o valor muda: o scroll chama isto várias vezes por quadro.
      let ultimoPalco = -1;
      let ultimaSombra = -1;
      let ultimaLuz = -1;
      const aplicarPalco = () => {
        // Recua durante "portas" e "recursos" para dar lugar ao texto e volta no final.
        const palco = 1 - 0.62 * brutoCena.meio * (1 - brutoCena.fim);
        if (palco !== ultimoPalco) {
          ultimoPalco = palco;
          definirOpacidade(palco);
        }
        // Sombra de leitura da "história": camada fixa que entra no fim da transição e sai por opacidade,
        // então não existe borda de seção para aparecer como uma linha na tela.
        const sombra = rampa(brutoCena.hero, 0.7, 1) * (1 - Math.min(1, brutoCena.meio * 1.4));
        if (sombra !== ultimaSombra) {
          ultimaSombra = sombra;
          definirSombra(sombra);
        }
        // O halo do cursor só existe enquanto o núcleo está livre, no topo da página.
        const luz = 1 - Math.min(1, brutoCena.hero * 12);
        const aplicarLuz = definirLuz;
        if (aplicarLuz && luz !== ultimaLuz) {
          ultimaLuz = luz;
          aplicarLuz(luz);
        }
      };

      // Ordem importa: os gatilhos são criados na ordem em que aparecem na página,
      // e os que vêm depois da seção fixada precisam nascer depois dela.
      /* ---------- Transição sol → gosma: o hero fica fixado por ~2,8 telas de rolagem ----------
         A cena (CenaNucleo) conduz o olhar em fases: planetas em espiral → clarão → o disco "incha" em esfera 3D
         → a distorção sobe até a gosma. Tudo é função de brutoCena.hero, então rolar para cima desfaz a transição. */
      // Elementos resolvidos uma vez (antes, um seletor de texto era consultado a cada tick de scroll) e escrita
      // no DOM só quando o valor muda: depois do início da transição o texto já saiu e nada mais é escrito.
      const conteudoHero = gsap.utils.toArray<HTMLElement>('.hero-conteudo');
      const rodapeHero = gsap.utils.toArray<HTMLElement>('.hero-rodape');
      let ultimoSai = -1;
      let ultimoRodape = -1;
      const aplicarHero = (self: ScrollTrigger) => {
        brutoCena.hero = self.progress;
        // O texto, os botões e o indicador "Role" saem logo no início da transição, presos ao mesmo progresso
        // (antes eram ScrollTriggers separados que não disparavam com o hero fixado e ficavam na frente da cena).
        const sai = rampa(self.progress, 0, 0.12);
        if (sai !== ultimoSai) {
          ultimoSai = sai;
          gsap.set(conteudoHero, { opacity: 1 - sai, yPercent: -14 * sai, pointerEvents: sai > 0.9 ? 'none' : 'auto' });
        }
        const rodape = 1 - rampa(self.progress, 0, 0.03);
        if (rodape !== ultimoRodape) {
          ultimoRodape = rodape;
          gsap.set(rodapeHero, { opacity: rodape });
        }
        aplicarPalco();
      };

      ScrollTrigger.create({
        trigger: '.inicio-hero',
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * TELAS_DA_TRANSICAO)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Atualiza também ao ser ultrapassado, ao voltar e ao recalcular: um salto direto para a história
        // (link, recarregar no meio da página) precisa deixar o hero no fim, não parado no meio.
        onUpdate: aplicarHero,
        onRefresh: aplicarHero,
        onLeave: aplicarHero,
        onLeaveBack: aplicarHero,
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
          scrub: SUAVIZACAO.dom,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self: ScrollTrigger) => {
            brutoCena.historia = self.progress;
            marcarPasso(self.progress);
          },
          onLeaveBack: () => {
            brutoCena.historia = 0;
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
        scrollTrigger: { trigger: '.ini-marquee', start: 'top bottom', end: 'bottom top', scrub: SUAVIZACAO.dom },
      });
      gsap.fromTo(
        '.marq-b',
        { xPercent: -32 },
        { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ini-marquee', start: 'top bottom', end: 'bottom top', scrub: SUAVIZACAO.dom } }
      );

      /* ---------- Ponteiro: luz que segue o cursor e parallax do núcleo ---------- */
      if (temPonteiroFino()) {
        const luzX = gsap.quickTo('.inicio-luz', 'x', { duration: 0.9, ease: 'power3.out' });
        const luzY = gsap.quickTo('.inicio-luz', 'y', { duration: 0.9, ease: 'power3.out' });
        definirLuz = gsap.quickSetter('.inicio-luz', 'opacity') as (v: number) => void;
        const mover = (e: PointerEvent) => {
          // Depois que o título sai de cena há texto na frente do núcleo: ele para de reagir ao mouse.
          if (brutoCena.hero > LIMITE_INTERACAO) {
            estadoCena.mx = estadoCena.my = 0;
            return;
          }
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
        // Sem WebGL o núcleo em CSS acompanha a mesma jornada, lendo o mesmo estado já suavizado.
        const alvo: AlvoNucleo = { x: 0, y: 0, escala: 1 };
        const acompanhar = () => {
          calcularAlvo(estadoCena, alvo);
          const u = window.innerHeight / UNIDADES_POR_ALTURA;
          gsap.set('.inicio-palco-css', { x: alvo.x * u, y: -alvo.y * u, scale: alvo.escala });
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
              <SolCanvas />
            </div>
          )}
        </div>
        <div className="inicio-vinheta" />
        <div className="inicio-sombra" />
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
            Aulas
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
