import { LessonListItem } from '../../api/tipos';
import { Presentation, ImageIcon, ArrowRight, Calendar } from 'lucide-react';
import { useRoteador } from '../../app/Roteador';

interface CartaoAulaProps {
  aula: LessonListItem;
}

function formatarData(dataIso: string): string {
  try {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeZone: 'America/Fortaleza',
    }).format(data);
  } catch {
    return 'Data recente';
  }
}

export default function CartaoAula({ aula }: CartaoAulaProps) {
  const { navegar } = useRoteador();

  return (
    <article
      onClick={() => navegar(`/aulas/${aula.id}`)}
      className="art-frame rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer group border border-gold/30 hover:border-gold relative flex flex-col justify-between"
      role="link"
      tabIndex={0}
      aria-label={`Ver aula ${aula.title} de ${aula.subject}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navegar(`/aulas/${aula.id}`);
        }
      }}
    >
      <div>
        {/* Metadados: Disciplina e Data */}
        <div className="flex items-center justify-between gap-2 text-xs mb-3">
          <span className="font-semibold px-2.5 py-1 rounded-full bg-gold/15 text-terra-deep tracking-wider uppercase text-[10px]">
            {aula.subject}
          </span>
          <span className="text-ink-soft flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            <time dateTime={aula.createdAt}>{formatarData(aula.createdAt)}</time>
          </span>
        </div>

        {/* Título da Aula */}
        <h3 className="font-display text-2xl font-bold text-ink group-hover:text-terra transition-colors leading-snug">
          {aula.title}
        </h3>
      </div>

      {/* Badges de recursos disponíveis & Ação */}
      <div className="mt-6 pt-4 border-t border-gold/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {aula.hasSlides === true && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ink/5 text-ink-soft text-[11px]"
              title="Apresentação de slides disponível"
            >
              <Presentation className="w-3 h-3 text-gold-deep" aria-hidden="true" />
              <span>Slides</span>
            </span>
          )}
          {aula.hasImages === true && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ink/5 text-ink-soft text-[11px]"
              title="Fotos do quadro anexadas"
            >
              <ImageIcon className="w-3 h-3 text-gold-deep" aria-hidden="true" />
              <span>Quadro</span>
            </span>
          )}
        </div>

        <span className="font-semibold text-ink group-hover:text-terra inline-flex items-center gap-1 transition-colors">
          <span>Ver aula</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </article>
  );
}
