import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SlidePresentation } from '../../api/tipos';
import { derivarSlides } from './deckSlides';
import SlideItemRenderer from './SlideItemRenderer';
import MiniaturasSlides from './MiniaturasSlides';
import DeckImpressao from './DeckImpressao';
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
      <div className="art-frame rounded-2xl p-12 text-center border border-gold/30 anim-fade-up">
        <PresentationIcon className="w-12 h-12 text-gold-deep mx-auto mb-3 opacity-70" aria-hidden="true" />
        <h3 className="font-display text-2xl font-bold text-ink">
          Os slides desta aula ainda não foram gerados
        </h3>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
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
      className={`${
        expandido
          ? 'fixed inset-0 z-50 bg-parchment overflow-y-auto p-3 sm:p-8 flex flex-col gap-4'
          : 'space-y-6 anim-fade-up'
      } print:static print:block print:bg-transparent print:p-0 print:gap-0`}
      role="region"
      aria-roledescription="apresentação"
      aria-label={presentation.title}
    >
      {/* Barra superior */}
      {!modoFoco && (
        <div className="flex flex-wrap items-center justify-between gap-4 no-print print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold px-3 py-1 rounded-full bg-gold/15 text-terra-deep uppercase text-xs tracking-wider">
              {disciplina}
            </span>
            <span className="font-display font-bold text-lg text-ink hidden sm:inline truncate max-w-sm">
              {presentation.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={alternarModoFoco}
              className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-full border border-gold/40 hover:bg-gold/15 text-ink transition-colors"
              title="Modo foco"
              aria-pressed={modoFoco}
              aria-label="Entrar no modo foco"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={alternarTelaCheia}
              className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-full border border-gold/40 hover:bg-gold/15 text-ink transition-colors"
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
              className="gold-outline-btn min-h-11 px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
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
        <div className="flex items-center justify-center gap-2 no-print print:hidden">
          <button
            type="button"
            onClick={alternarModoFoco}
            className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full border border-gold/40 bg-parchment text-ink text-sm font-semibold hover:bg-gold/15 transition-colors"
          >
            <EyeOff className="w-4 h-4" aria-hidden="true" />
            <span>Sair do modo foco</span>
          </button>
        </div>
      )}

      {/* Palco 16:9 */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <div
          ref={palcoRef}
          tabIndex={-1}
          onTouchStart={aoTocarInicio}
          onTouchEnd={aoTocarFim}
          className="slide-canvas w-full max-w-5xl mx-auto aspect-[16/9] art-frame rounded-2xl sm:rounded-3xl border-2 border-gold/40 shadow-2xl relative overflow-hidden flex flex-col paper-grain select-none bg-gradient-to-br from-[#f8f2e7] to-[#ece3d0] focus-visible:outline-2 focus-visible:outline-terra-deep print:hidden"
        >
          <div className="sr-only" aria-live="polite">
            Slide {indiceAtual + 1} de {totalSlides}: {slideAtual.title}
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

          <div
            key={`${slideAtual.indiceOriginal}-${indiceAtual}`}
            className={`flex-1 min-h-0 overflow-hidden ${
              direcao === 'forward' ? 'slide-forward' : 'slide-backward'
            }`}
          >
            <SlideItemRenderer
              slide={slideAtual}
              layout={slideAtual.layoutResolvido}
              disciplina={disciplina}
            />
          </div>

          <div className="slide-palco-rodape border-t border-gold/25 flex items-center justify-between gap-3 bg-parchment/60">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-gold-deep flex-shrink-0" aria-hidden="true" />
              <span className="font-display font-medium slide-meta text-ink truncate">
                {slideAtual.title}
              </span>
            </div>

            <div className="font-display font-bold slide-meta text-ink flex-shrink-0">
              <span className="text-terra-deep">{indiceAtual + 1}</span>
              <span className="mx-1 text-ink-soft/60">de</span>
              <span>{totalSlides}</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-gold/15">
            <div
              className="h-full bg-gradient-to-r from-gold to-terra transition-all duration-300"
              style={{ width: `${progressoPorcentagem}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controles de navegação */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 no-print print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={anterior}
            disabled={indiceAtual === 0}
            className={`min-h-11 px-5 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              indiceAtual === 0
                ? 'opacity-50 cursor-not-allowed bg-ink/5 text-ink-soft'
                : 'ink-btn'
            }`}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={proximo}
            disabled={indiceAtual === totalSlides - 1}
            className={`min-h-11 px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              indiceAtual === totalSlides - 1
                ? 'opacity-50 cursor-not-allowed bg-ink/5 text-ink-soft'
                : 'ink-btn'
            }`}
            aria-label="Próximo slide"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!modoFoco && (
          <div className="text-center sm:text-right text-xs text-ink-soft flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-deep" aria-hidden="true" />
            <span>Setas ← →, Home e End, ou deslize no celular</span>
          </div>
        )}
      </div>

      {aviso && (
        <p className="text-center text-xs text-ink-soft no-print print:hidden" role="status" aria-live="polite">
          {aviso}
        </p>
      )}

      {/* Miniaturas (somente desktop e fora do modo foco) */}
      {!modoFoco && (
        <div className="max-w-5xl w-full mx-auto no-print print:hidden">
          <MiniaturasSlides
            slides={slides}
            indiceAtual={indiceAtual}
            onSelecionar={(idx) => irPara(idx)}
            disciplina={disciplina}
          />
        </div>
      )}

      {!modoFoco && (
        <p className="text-center text-xs text-ink-soft/80 no-print print:hidden">
          Slides gerados por IA a partir do resumo da aula.
        </p>
      )}

      <DeckImpressao slides={slides} disciplina={disciplina} titulo={presentation.title} />
    </section>
  );
}
