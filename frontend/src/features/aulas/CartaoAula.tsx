import { Presentation, ImageIcon, ChevronRight, Calendar } from 'lucide-react';
import { LessonListItem } from '../../api/tipos';
import { tomDaDisciplina } from '../../lib/tomDisciplina';

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

/**
 * Cartão de aula. É um link de verdade (#/aulas/:id): o roteador por hash
 * cuida da rolagem e do foco, e o clique com Ctrl/Cmd abre em outra aba.
 * Estilos: .av-cartao e filhos em aulas.css; o tom vem de data-tom (tokens.css).
 */
export default function CartaoAula({ aula }: CartaoAulaProps) {
  return (
    <a
      href={`#/aulas/${aula.id}`}
      className="av-cartao"
      data-tom={tomDaDisciplina(aula.subject)}
      aria-label={`Ver aula ${aula.title} de ${aula.subject}`}
    >
      <div>
        <div className="av-cartao-meta">
          <span className="av-tag" title={aula.subject}>
            {aula.subject}
          </span>
          <span className="av-data">
            <Calendar size={14} aria-hidden="true" />
            <time dateTime={aula.createdAt}>{formatarData(aula.createdAt)}</time>
          </span>
        </div>

        <h3 className="av-cartao-titulo">{aula.title}</h3>
      </div>

      <div className="av-cartao-rodape">
        <div className="flex flex-wrap items-center gap-2">
          {aula.hasSlides === true && (
            <span className="av-selo" title="Apresentação de slides disponível">
              <Presentation size={12} aria-hidden="true" />
              <span>Slides</span>
            </span>
          )}
          {aula.hasImages === true && (
            <span className="av-selo" title="Fotos do quadro anexadas">
              <ImageIcon size={12} aria-hidden="true" />
              <span>Quadro</span>
            </span>
          )}
        </div>

        <span className="av-ver" aria-hidden="true">
          <span>Ver aula</span>
          <ChevronRight size={16} />
        </span>
      </div>
    </a>
  );
}
