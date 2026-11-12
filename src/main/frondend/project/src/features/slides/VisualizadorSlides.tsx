import { useState, useEffect, useRef, useCallback } from 'react';
import { SlidePresentation } from '../../api/tipos';
import { resolverLayout } from './heuristicaLayout';
import SlideItemRenderer from './SlideItemRenderer';
import MiniaturasSlides from './MiniaturasSlides';
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

export default function VisualizadorSlides({
  presentation,
  disciplina,
}: VisualizadorSlidesProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [direcao, setDirecao] = useState<'forward' | 'backward'>('forward');
  const [emTelaCheia, setEmTelaCheia] = useState(false);
  const [modoFoco, setModoFoco] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const slides = presentation?.slides || [];
  const totalSlides = slides.length;

  const irPara = useCallback(
    (novoIndice: number, dir?: 'forward' | 'backward') => {
      if (novoIndice < 0 || novoIndice >= totalSlides) return;
      setDirecao(dir || (novoIndice > indiceAtual ? 'forward' : 'backward'));
      setIndiceAtual(novoIndice);
    },
    [indiceAtual, totalSlides]
  );

  const proximo = useCallback(() => {
    if (indiceAtual < totalSlides - 1) {
      irPara(indiceAtual + 1, 'forward');
    }
  }, [indiceAtual, totalSlides, irPara]);

  const anterior = useCallback(() => {
    if (indiceAtual > 0) {
      irPara(indiceAtual - 1, 'backward');
    }
  }, [indiceAtual, irPara]);

  // Navegação por teclado: Setas ← →, Home, End
  useEffect(() => {
    const tratarTeclado = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
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
      }
    };

    window.addEventListener('keydown', tratarTeclado);
    return () => window.removeEventListener('keydown', tratarTeclado);
  }, [proximo, anterior, irPara, totalSlides]);

  // Gestos de toque no celular (Swipe touch, threshold 40px)
  const aoTocarInicio = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const aoTocarFim = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        proximo();
      } else {
        anterior();
      }
    }
    touchStartX.current = null;
  };

  // Fullscreen API
  const alternarTelaCheia = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setEmTelaCheia(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setEmTelaCheia(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const aoMudarFullscreen = () => {
      setEmTelaCheia(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', aoMudarFullscreen);
    return () => document.removeEventListener('fullscreenchange', aoMudarFullscreen);
  }, []);

  const aoImprimir = () => {
    window.print();
  };

  if (!presentation || totalSlides === 0) {
    return (
      <div className="art-frame rounded-2xl p-12 text-center border border-gold/30 anim-fade-up">
        <PresentationIcon className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-display text-2xl font-bold text-ink">Os slides desta aula ainda não foram gerados</h3>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
          Esta aula foi processada em uma versão anterior ou os slides didáticos estão sendo estruturados.
        </p>
      </div>
    );
  }

  const slideAtual = slides[indiceAtual];
  const layoutAtual = resolverLayout(slideAtual, indiceAtual, totalSlides);
  const progressoPorcentagem = ((indiceAtual + 1) / totalSlides) * 100;

  return (
    <section
      ref={containerRef}
      className={`space-y-6 ${
        emTelaCheia
          ? 'fixed inset-0 z-50 bg-parchment p-6 sm:p-10 flex flex-col justify-between overflow-y-auto'
          : 'anim-fade-up'
      }`}
      role="region"
      aria-roledescription="apresentação de slides"
      aria-label={presentation.title}
    >
      {/* Barra de Controles e Status Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <span className="font-semibold px-3 py-1 rounded-full bg-gold/15 text-terra-deep uppercase text-xs tracking-wider">
            {disciplina}
          </span>
          <span className="font-display font-bold text-lg text-ink hidden sm:inline truncate max-w-sm">
            {presentation.title}
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModoFoco((m) => !m)}
            className="p-2 rounded-full border border-gold/30 hover:bg-gold/15 text-ink transition-colors"
            title={modoFoco ? 'Sair do modo foco' : 'Modo foco'}
            aria-label={modoFoco ? 'Sair do modo foco' : 'Modo foco'}
          >
            {modoFoco ? <EyeOff className="w-4 h-4 text-terra" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={alternarTelaCheia}
            className="p-2 rounded-full border border-gold/30 hover:bg-gold/15 text-ink transition-colors"
            title={emTelaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}
            aria-label={emTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {emTelaCheia ? <Minimize2 className="w-4 h-4 text-terra" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={aoImprimir}
            className="gold-outline-btn px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
            title="Imprimir ou salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Palco do Slide (Proporção 16:9 estrita com moldura de arte e textura) */}
      <div
        onTouchStart={aoTocarInicio}
        onTouchEnd={aoTocarFim}
        className="w-full max-w-5xl mx-auto aspect-[16/9] min-h-[340px] sm:min-h-[460px] art-frame rounded-3xl border-2 border-gold/40 shadow-2xl relative overflow-hidden flex flex-col justify-between paper-grain select-none bg-gradient-to-br from-[#f8f2e7] to-[#ece3d0]"
      >
        {/* Anúncio acessível para leitores de tela */}
        <div className="sr-only" aria-live="polite">
          Slide {indiceAtual + 1} de {totalSlides}: {slideAtual.title}
        </div>

        {/* Fio de ouro de cabeçalho do slide */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

        {/* Palco central do conteúdo com transição animada */}
        <div
          key={indiceAtual}
          className={`flex-1 overflow-y-auto ${
            direcao === 'forward' ? 'slide-forward' : 'slide-backward'
          }`}
        >
          <SlideItemRenderer
            slide={slideAtual}
            layout={layoutAtual}
            disciplina={disciplina}
          />
        </div>

        {/* Rodapé interno do slide */}
        <div className="p-4 sm:p-6 border-t border-gold/20 flex items-center justify-between text-xs text-ink-soft bg-parchment/60 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold anim-breathe" />
            <span className="font-display font-medium text-xs sm:text-sm text-ink truncate max-w-xs">
              {slideAtual.title}
            </span>
          </div>

          <div className="font-display font-bold text-sm sm:text-base text-ink">
            <span className="text-gold">{indiceAtual + 1}</span>
            <span className="mx-1 text-ink-soft/50">/</span>
            <span>{totalSlides}</span>
          </div>
        </div>

        {/* Barra de Progresso Dourada Fluida */}
        <div className="h-1.5 w-full bg-gold/15 no-print">
          <div
            className="h-full bg-gradient-to-r from-gold to-terra transition-all duration-300"
            style={{ width: `${progressoPorcentagem}%` }}
          />
        </div>
      </div>

      {/* Controles de Navegação Inferiores */}
      {!modoFoco && (
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={anterior}
              disabled={indiceAtual === 0}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                indiceAtual === 0
                  ? 'opacity-40 cursor-not-allowed bg-ink/5 text-ink-soft'
                  : 'ink-btn'
              }`}
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={proximo}
              disabled={indiceAtual === totalSlides - 1}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                indiceAtual === totalSlides - 1
                  ? 'opacity-40 cursor-not-allowed bg-ink/5 text-ink-soft'
                  : 'ink-btn'
              }`}
              aria-label="Próximo slide"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-right text-xs text-ink-soft flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Use as setas ← → ou deslize no celular</span>
          </div>
        </div>
      )}

      {/* Faixa de Miniaturas no Desktop */}
      {!modoFoco && (
        <div className="max-w-5xl mx-auto">
          <MiniaturasSlides
            slides={slides}
            indiceAtual={indiceAtual}
            onSelecionar={(idx) => irPara(idx)}
            disciplina={disciplina}
          />
        </div>
      )}

      {/* Rodapé descritivo */}
      <p className="text-center text-xs text-ink-soft/70 no-print">
        Slides gerados por IA a partir do resumo da aula.
      </p>

      {/* Versão oculta para Impressão limpa (1 slide por página em paisagem) */}
      <div className="hidden print:block space-y-8">
        {slides.map((s, idx) => {
          const lay = resolverLayout(s, idx, totalSlides);
          return (
            <div
              key={idx}
              className="slide-container-print p-12 bg-white flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-xs border-b pb-2 mb-4">
                <span className="font-bold">{disciplina} &middot; {presentation.title}</span>
                <span>Slide {idx + 1} de {totalSlides}</span>
              </div>
              <div className="flex-1">
                <SlideItemRenderer slide={s} layout={lay} disciplina={disciplina} />
              </div>
              <div className="text-center text-[10px] text-gray-500 pt-4 border-t mt-4">
                AulaViva &middot; Material gerado por Inteligência Artificial
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
