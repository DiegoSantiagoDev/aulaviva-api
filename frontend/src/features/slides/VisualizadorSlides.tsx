import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SlidePresentation } from '../../api/tipos.ts';
import { derivarSlides } from './deckSlides.ts';
import SlideItemRenderer from './SlideItemRenderer.tsx';
import MiniaturasSlides from './MiniaturasSlides.tsx';
import DeckImpressao from './DeckImpressao.tsx';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Presentation as PresentationIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import './slides.css';

interface VisualizadorSlidesProps {
  presentation: SlidePresentation | null | undefined;
  disciplina: string;
}

/** Elementos interativos não devem ter os atalhos do visualizador capturados. */
function alvoInterativo(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, summary, [role="button"], [role="tab"], [contenteditable="true"]'
    )
  );
}

export default function VisualizadorSlides({
  presentation,
  disciplina,
}: VisualizadorSlidesProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [direcao, setDirecao] = useState<'forward' | 'backward'>('forward');
  const [emTelaCheia, setEmTelaCheia] = useState(false);
  const [modoFoco, setModoFoco] = useState(false);
  const [aviso, setAviso] = useState('');

  const containerRef = useRef<HTMLElement | null>(null);
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const touchInicio = useRef<{ x: number; y: number } | null>(null);

  const slides = useMemo(() => derivarSlides(presentation?.slides ?? []), [presentation]);
  const totalSlides = slides.length;

  // Ao trocar de apresentação, volta ao primeiro slide.
  useEffect(() => {
    setIndiceAtual(0);
  }, [presentation]);

  // Garante índice válido caso a apresentação encolha.
  useEffect(() => {
    setIndiceAtual((atual) => Math.min(atual, Math.max(totalSlides - 1, 0)));
  }, [totalSlides]);

  const irPara = useCallback(
    (novoIndice: number, dir?: 'forward' | 'backward') => {
      if (novoIndice < 0 || novoIndice >= totalSlides) return;
      setDirecao(dir || (novoIndice > indiceAtual ? 'forward' : 'backward'));
      setIndiceAtual(novoIndice);
    },
    [indiceAtual, totalSlides]
  );

  const proximo = useCallback(() => {
    if (indiceAtual < totalSlides - 1) irPara(indiceAtual + 1, 'forward');
  }, [indiceAtual, totalSlides, irPara]);

  const anterior = useCallback(() => {
    if (indiceAtual > 0) irPara(indiceAtual - 1, 'backward');
  }, [indiceAtual, irPara]);

  // Navegação por teclado: setas, Home, End, espaço (fora de controles) e Esc.
  useEffect(() => {
    const tratarTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modoFoco) {
          setModoFoco(false);
          setAviso('Modo foco encerrado.');
        }
        return;
      }

      if (alvoInterativo(e.target)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        proximo();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        anterior();
      } else if (e.key === 'Home') {
        e.preventDefault();
        irPara(0, 'backward');
      } else if (e.key === 'End') {
        e.preventDefault();
        irPara(totalSlides - 1, 'forward');
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        proximo();
      }
    };

    window.addEventListener('keydown', tratarTeclado);
    return () => window.removeEventListener('keydown', tratarTeclado);
  }, [proximo, anterior, irPara, totalSlides, modoFoco]);

  // Gestos de toque: só considera swipe horizontal dominante acima de 40 px.
  const aoTocarInicio = (e: React.TouchEvent) => {
    touchInicio.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const aoTocarFim = (e: React.TouchEvent) => {
    if (!touchInicio.current) return;

    const fimX = e.changedTouches[0].clientX;
    const fimY = e.changedTouches[0].clientY;
    const diffX = touchInicio.current.x - fimX;
    const diffY = touchInicio.current.y - fimY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) proximo();
      else anterior();
    }

    touchInicio.current = null;
  };

  // Fullscreen API
  const alternarTelaCheia = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setEmTelaCheia(true);
        requestAnimationFrame(() => palcoRef.current?.focus());
      } else {
        await document.exitFullscreen();
        setEmTelaCheia(false);
      }
    } catch {
      setAviso('A tela cheia não está disponível neste navegador.');
    }
  };

  useEffect(() => {
    const aoMudarFullscreen = () => setEmTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', aoMudarFullscreen);
    return () => document.removeEventListener('fullscreenchange', aoMudarFullscreen);
  }, []);

  // Ao entrar no modo foco, move o foco para o palco (sem roubar dos controles).
  useEffect(() => {
    if (modoFoco) requestAnimationFrame(() => palcoRef.current?.focus());
  }, [modoFoco]);

  const alternarModoFoco = () => {
    setModoFoco((ativo) => {
      setAviso(ativo ? 'Modo foco encerrado.' : 'Modo foco ativado. Use as setas para navegar.');
      return !ativo;
    });
  };

  const aoImprimir = () => window.print();

  if (!presentation || totalSlides === 0) {
    return (
      <div className="av-estado av-estado-vazio anim-fade-up">
        <div className="av-estado-icone">
          <PresentationIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="av-estado-titulo">Os slides desta aula ainda não foram gerados</h3>
        <p className="av-estado-texto">
          O back-end atual ainda não gera apresentações de slides. Quando esse recurso estiver
          disponível para esta aula, os slides aparecerão aqui.
        </p>
      </div>
    );
  }

  const slideAtual = slides[indiceAtual];
  const progressoPorcentagem = ((indiceAtual + 1) / totalSlides) * 100;
  const expandido = modoFoco || emTelaCheia;

  return (
    <section
      ref={containerRef}
      className={`av-sl-raiz ${expandido ? 'av-sl-expandido' : 'anim-fade-up'}`}
      role="region"
      aria-roledescription="apresentação"
      aria-label={presentation.title}
    >
      {/* Barra superior */}
      {!modoFoco && (
        <div className="av-sl-barra no-print">
          <div className="av-sl-barra-info">
            <span className="av-sl-tag">{disciplina}</span>
            <span className="av-sl-titulo-deck hidden sm:inline">{presentation.title}</span>
          </div>

          <div className="av-sl-barra-acoes">
            <button
              type="button"
              onClick={alternarModoFoco}
              className="av-sl-icone"
              title="Modo foco"
              aria-pressed={modoFoco}
              aria-label="Entrar no modo foco"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={alternarTelaCheia}
              className="av-sl-icone"
              title={emTelaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}
              aria-label={emTelaCheia ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            >
              {emTelaCheia ? (
                <Minimize2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={aoImprimir}
              className="av-btn av-btn-contorno av-sl-pdf"
              title="Imprimir ou salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra compacta do modo foco */}
      {modoFoco && (
        <div className="av-sl-modo-foco no-print">
          <button type="button" onClick={alternarModoFoco} className="av-btn av-btn-contorno av-sl-pdf">
            <EyeOff className="w-4 h-4" aria-hidden="true" />
            <span>Sair do modo foco</span>
          </button>
        </div>
      )}

      {/* Palco 16:9 */}
      <div className="av-sl-cena">
        <div
          ref={palcoRef}
          tabIndex={-1}
          onTouchStart={aoTocarInicio}
          onTouchEnd={aoTocarFim}
          className="slide-canvas av-sl-palco paper-grain no-print"
        >
          <div className="sr-only" aria-live="polite">
            Slide {indiceAtual + 1} de {totalSlides}: {slideAtual.title}
          </div>

          <div className="av-sl-fio" />

          <div
            key={`${slideAtual.indiceOriginal}-${indiceAtual}`}
            className={`av-sl-conteudo ${direcao === 'forward' ? 'slide-forward' : 'slide-backward'}`}
          >
            <SlideItemRenderer
              slide={slideAtual}
              layout={slideAtual.layoutResolvido}
              disciplina={disciplina}
            />
          </div>

          <div className="av-sl-rodape slide-palco-rodape">
            <div className="av-sl-rodape-titulo">
              <span className="av-sl-ponto" aria-hidden="true" />
              <span className="slide-meta">{slideAtual.title}</span>
            </div>

            <div className="av-sl-contador slide-meta">
              <b>{indiceAtual + 1}</b>
              <i>de</i>
              <span>{totalSlides}</span>
            </div>
          </div>

          <div className="av-sl-progresso">
            <div style={{ width: `${progressoPorcentagem}%` }} />
          </div>
        </div>
      </div>

      {/* Controles de navegação */}
      <div className="av-sl-controles no-print">
        <div className="av-sl-nav-grupo">
          <button
            type="button"
            onClick={anterior}
            disabled={indiceAtual === 0}
            className="av-btn av-btn-contorno av-sl-nav"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={proximo}
            disabled={indiceAtual === totalSlides - 1}
            className="av-btn av-btn-primario av-sl-nav"
            aria-label="Próximo slide"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!modoFoco && (
          <p className="av-sl-dica">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Setas ← →, Home e End, ou deslize no celular</span>
          </p>
        )}
      </div>

      {aviso && (
        <p className="av-sl-aviso no-print" role="status" aria-live="polite">
          {aviso}
        </p>
      )}

      {/* Miniaturas (fora do modo foco) */}
      {!modoFoco && (
        <div className="w-full max-w-5xl mx-auto no-print">
          <MiniaturasSlides
            slides={slides}
            indiceAtual={indiceAtual}
            onSelecionar={(idx) => irPara(idx)}
            disciplina={disciplina}
          />
        </div>
      )}

      {!modoFoco && (
        <p className="av-sl-nota no-print">Slides gerados por IA a partir do resumo da aula.</p>
      )}

      <DeckImpressao slides={slides} disciplina={disciplina} titulo={presentation.title} />
    </section>
  );
}
