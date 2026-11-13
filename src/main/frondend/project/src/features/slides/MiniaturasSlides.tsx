import { Check } from 'lucide-react';
import SlideItemRenderer from './SlideItemRenderer';
import type { SlideDerivado } from './deckSlides';

interface MiniaturasSlidesProps {
  slides: SlideDerivado[];
  indiceAtual: number;
  onSelecionar: (indice: number) => void;
  disciplina: string;
}

/** Escala exata: o preview é desenhado em 960×540 e reduzido para 192×108. */
const ESCALA_MINIATURA = 0.2;

export default function MiniaturasSlides({
  slides,
  indiceAtual,
  onSelecionar,
  disciplina,
}: MiniaturasSlidesProps) {
  return (
    <div className="no-print">
      {/* Desktop: miniaturas reais, reaproveitando os layouts */}
      <div className="hidden lg:flex items-stretch gap-3 overflow-x-auto p-3 rounded-2xl art-frame border border-gold/25">
        {slides.map((slide, idx) => {
          const ativo = indiceAtual === idx;
          return (
            <button
              key={`${slide.indiceOriginal}-${idx}`}
              type="button"
              onClick={() => onSelecionar(idx)}
              aria-label={`Ir para slide ${idx + 1} de ${slides.length}: ${slide.title}`}
              aria-current={ativo ? 'step' : undefined}
              className={`relative flex-shrink-0 w-48 aspect-[16/9] rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                ativo
                  ? 'border-terra-deep ring-2 ring-terra-deep/40 shadow-lg'
                  : 'border-gold/25 hover:border-gold/70'
              }`}
            >
              <div
                className="slide-canvas slide-miniatura absolute top-0 left-0"
                style={{
                  width: 960,
                  height: 540,
                  transform: `scale(${ESCALA_MINIATURA})`,
                  transformOrigin: 'top left',
                }}
                aria-hidden="true"
              >
                <SlideItemRenderer
                  slide={slide}
                  layout={slide.layoutResolvido}
                  disciplina={disciplina}
                />
              </div>

              <span
                className={`absolute bottom-1 right-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  ativo ? 'bg-terra-deep text-parchment' : 'bg-parchment/90 text-ink'
                }`}
              >
                {ativo && <Check className="w-3 h-3" aria-hidden="true" />}
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Celular/tablet: faixa numerada com alvos de toque de 44 px */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto p-2 rounded-2xl art-frame border border-gold/25">
        {slides.map((slide, idx) => {
          const ativo = indiceAtual === idx;
          return (
            <button
              key={`mobile-${slide.indiceOriginal}-${idx}`}
              type="button"
              onClick={() => onSelecionar(idx)}
              aria-label={`Ir para slide ${idx + 1} de ${slides.length}: ${slide.title}`}
              aria-current={ativo ? 'step' : undefined}
              className={`flex-shrink-0 inline-flex items-center justify-center gap-1.5 min-w-11 min-h-11 px-2.5 rounded-xl border-2 text-sm font-bold transition-colors ${
                ativo
                  ? 'border-terra-deep bg-terra-deep text-parchment'
                  : 'border-gold/30 bg-parchment/70 text-ink-soft hover:border-gold/70'
              }`}
            >
              {ativo ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{idx + 1}</span>
              )}
              <span className="sr-only">{slide.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
