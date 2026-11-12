import { SlideItem } from '../../api/tipos';
import { resolverLayout } from './heuristicaLayout';

interface MiniaturasSlidesProps {
  slides: SlideItem[];
  indiceAtual: number;
  onSelecionar: (indice: number) => void;
  disciplina: string;
}

export default function MiniaturasSlides({
  slides,
  indiceAtual,
  onSelecionar,
}: MiniaturasSlidesProps) {
  return (
    <div className="hidden lg:flex items-center gap-3 overflow-x-auto p-3 rounded-2xl art-frame border border-gold/25 no-print">
      {slides.map((s, idx) => {
        const layout = resolverLayout(s, idx, slides.length);
        const ativo = indiceAtual === idx;
        return (
          <button
            key={idx}
            onClick={() => onSelecionar(idx)}
            className={`flex-shrink-0 w-28 aspect-[16/9] rounded-lg p-2 text-left transition-all duration-300 relative border flex flex-col justify-between overflow-hidden cursor-pointer ${
              ativo
                ? 'border-gold bg-gold/20 shadow-md scale-105 ring-2 ring-gold/40'
                : 'border-gold/20 bg-parchment/60 hover:border-gold/60 hover:bg-gold/10'
            }`}
            aria-label={`Ir para slide ${idx + 1}: ${s.title}`}
          >
            <div className="flex items-center justify-between text-[9px] font-bold text-ink-soft">
              <span>#{idx + 1}</span>
              <span className="uppercase text-[8px] text-terra tracking-wider">{layout}</span>
            </div>
            <p className="text-[10px] font-display font-bold text-ink truncate leading-tight">
              {s.title}
            </p>
          </button>
        );
      })}
    </div>
  );
}
