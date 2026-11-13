import SlideItemRenderer from './SlideItemRenderer';
import type { SlideDerivado } from './deckSlides';

interface DeckImpressaoProps {
  slides: SlideDerivado[];
  disciplina: string;
  titulo: string;
}

/**
 * Versão exclusiva para impressão/PDF: um slide por página, em paisagem.
 * Fica oculta na tela (`hidden`) e só aparece em `@media print`.
 */
export default function DeckImpressao({ slides, disciplina, titulo }: DeckImpressaoProps) {
  return (
    <div className="deck-impressao hidden print:block">
      {slides.map((slide, idx) => (
        <article
          key={`impressao-${slide.indiceOriginal}-${idx}`}
          className="slide-container-print slide-canvas"
          aria-label={`Slide ${idx + 1} de ${slides.length}: ${slide.title}`}
        >
          <header className="slide-print-header">
            <span className="font-bold">
              {disciplina} &middot; {titulo}
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
            AulaViva &middot; Material gerado por Inteligência Artificial
          </footer>
        </article>
      ))}
    </div>
  );
}
