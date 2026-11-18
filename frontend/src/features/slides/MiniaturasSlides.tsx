import { Check } from 'lucide-react';
import SlideItemRenderer from './SlideItemRenderer.tsx';
import type { SlideDerivado } from './deckSlides.ts';
import './slides.css';

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
      <div className="av-sl-tira av-sl-tira-desktop">
        {slides.map((slide, idx) => {
          const ativo = indiceAtual === idx;
          return (
            <button
              key={`${slide.indiceOriginal}-${idx}`}
              type="button"
              onClick={() => onSelecionar(idx)}
              aria-label={`Ir para slide ${idx + 1} de ${slides.length}: ${slide.title}`}
              aria-current={ativo ? 'step' : undefined}
              className="av-sl-mini"
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

              <span className="av-sl-mini-num">
                {ativo && <Check className="w-3 h-3" aria-hidden="true" />}
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Celular/tablet: faixa numerada com alvos de toque de 44 px */}
      <div className="av-sl-tira av-sl-tira-celular">
        {slides.map((slide, idx) => {
          const ativo = indiceAtual === idx;
          return (
            <button
              key={`mobile-${slide.indiceOriginal}-${idx}`}
              type="button"
              onClick={() => onSelecionar(idx)}
              aria-label={`Ir para slide ${idx + 1} de ${slides.length}: ${slide.title}`}
              aria-current={ativo ? 'step' : undefined}
              className="av-sl-mini-celular"
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
