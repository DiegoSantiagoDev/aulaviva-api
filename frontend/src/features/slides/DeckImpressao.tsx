import SlideItemRenderer from './SlideItemRenderer.tsx';
import type { SlideDerivado } from './deckSlides.ts';
import './slides.css';

interface DeckImpressaoProps {
  slides: SlideDerivado[];
  disciplina: string;
  titulo: string;
}

/**
 * Versão exclusiva para impressão/PDF: um slide por página, em paisagem.
 * Fica oculta na tela (.av-sl-deck-imp) e só aparece em `@media print`.
 */
export default function DeckImpressao({ slides, disciplina, titulo }: DeckImpressaoProps) {
  return (
    <div className="deck-impressao av-sl-deck-imp">
      {slides.map((slide, idx) => (
        <article
          key={`impressao-${slide.indiceOriginal}-${idx}`}
          className="slide-container-print slide-canvas"
          aria-label={`Slide ${idx + 1} de ${slides.length}: ${slide.title}`}
        >
          <header className="slide-print-header">
            <span>
              <strong>{disciplina}</strong> <span>{titulo}</span>
            </span>
            <span>
              Slide {idx + 1} de {slides.length}
            </span>
          </header>

          <div className="slide-print-conteudo">
            <SlideItemRenderer
              slide={slide}
              layout={slide.layoutResolvido}
              disciplina={disciplina}
            />
          </div>

          <footer className="slide-print-footer">
            AulaViva — material gerado por inteligência artificial
          </footer>
        </article>
      ))}
    </div>
  );
}
