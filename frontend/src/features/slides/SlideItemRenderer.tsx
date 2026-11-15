import type { CSSProperties } from 'react';
import { SlideItem, SlideLayout } from '../../api/tipos';
import EmblemaCapaSlide from '../../components/EmblemaCapaSlide';
import { Check, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import './slides.css';

interface SlideItemRendererProps {
  slide: SlideItem;
  layout: SlideLayout;
  disciplina: string;
}

/**
 * Reduz levemente a tipografia em slides com muito texto, antes de
 * permitir rolagem interna. O valor vira a variável CSS `--slide-scale`.
 */
function calcularEscala(itens: string[]): number {
  const totalCaracteres = itens.reduce((total, item) => total + item.length, 0);
  const maiorItem = itens.reduce((maior, item) => Math.max(maior, item.length), 0);

  if (totalCaracteres > 900 || maiorItem > 320) return 0.72;
  if (totalCaracteres > 620 || maiorItem > 220) return 0.8;
  if (totalCaracteres > 440 || maiorItem > 160) return 0.87;
  if (totalCaracteres > 300) return 0.93;
  return 1;
}

export default function SlideItemRenderer({
  slide,
  layout,
  disciplina,
}: SlideItemRendererProps) {
  const itens = slide.content || [];
  const escala = calcularEscala(itens);
  const denso = itens.length >= 5 || itens.join(' ').length > 420;

  const estilo = { '--slide-scale': escala } as CSSProperties;

  const classesBase = `slide-layout av-sl h-full flex flex-col justify-center slide-pad ${
    denso ? 'slide-dense' : ''
  }`;

  switch (layout) {
    case 'capa':
      return (
        <div
          className="slide-layout av-sl h-full flex flex-col items-center justify-center text-center slide-pad gap-[clamp(0.6rem,2.5cqw,1.6rem)]"
          data-tom="terra"
          style={estilo}
        >
          <div className="w-[clamp(3.2rem,12cqw,7rem)] aspect-square">
            <EmblemaCapaSlide inView={true} className="av-sl-emblema w-full h-full" />
          </div>

          <span className="slide-label av-sl-rotulo av-sl-rotulo-centro">{disciplina}</span>

          <h2 className="slide-title-lg av-sl-h2 leading-[1.08] max-w-[24ch] mx-auto">
            {slide.title}
          </h2>

          <div className="w-[clamp(3rem,10cqw,8rem)] h-px gold-line mx-auto" />

          {itens.length > 0 && (
            <p className="slide-subtitle av-sl-subtitulo max-w-[52ch] mx-auto">{itens[0]}</p>
          )}
        </div>
      );

    case 'definicao': {
      const primeiraFrase = itens[0] || slide.title;
      const letraInicial = primeiraFrase.charAt(0);
      const restoFrase = primeiraFrase.slice(1);
      const explicacao = itens.slice(1);

      return (
        <div className={classesBase} data-tom="ouro" style={estilo}>
          <span className="slide-label av-sl-rotulo slide-item">
            <Sparkles className="w-[1.1em] h-[1.1em]" aria-hidden="true" />
            Definição fundamental
          </span>

          <h2 className="slide-title av-sl-h2 av-sl-h2-linha mt-[0.4em] slide-item">{slide.title}</h2>

          <div className="av-sl-citacao slide-item">
            <blockquote className="slide-quote font-display text-ink italic leading-[1.35]">
              <span className="av-sl-capitular">{letraInicial}</span>
              {restoFrase}
            </blockquote>
          </div>

          {explicacao.length > 0 && (
            <div className="mt-[0.7em] space-y-[0.45em] slide-scroll">
              {explicacao.map((item, idx) => (
                <p
                  key={idx}
                  className="slide-body text-ink-soft leading-relaxed slide-item"
                  style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'formula':
      return (
        <div className={classesBase} data-tom="destaque" style={estilo}>
          <span className="slide-label av-sl-rotulo slide-item">Expressões e relações</span>

          <h2 className="slide-title av-sl-h2 mt-[0.4em] slide-item">{slide.title}</h2>

          <div className="slide-grid-2 gap-[clamp(0.4rem,1.5cqw,0.9rem)] mt-[0.8em] slide-scroll">
            {itens.map((expr, idx) => (
              <div
                key={idx}
                className="slide-item av-sl-cartao av-sl-cartao-formula"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="slide-formula font-display font-bold text-ink tracking-wide break-words text-center">
                  {expr}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'exemplo':
      return (
        <div className={classesBase} data-tom="terra" style={estilo}>
          <div className="slide-item">
            <span className="slide-label av-sl-rotulo av-sl-rotulo-solido">
              <Lightbulb className="w-[1.05em] h-[1.05em]" aria-hidden="true" />
              Exemplo prático
            </span>
          </div>

          <h2 className="slide-title av-sl-h2 mt-[0.45em] slide-item">{slide.title}</h2>

          <div className="slide-item av-sl-exemplo slide-scroll" style={{ animationDelay: '80ms' }}>
            <div className="space-y-[0.5em]">
              {itens.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-[0.6em] slide-item"
                  style={{ animationDelay: `${(idx + 2) * 50}ms` }}
                >
                  <span className="slide-body av-sl-num">{idx + 1}</span>
                  <p className="slide-body text-ink leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'duas-colunas': {
      const metade = Math.ceil(itens.length / 2);
      const colunas = [itens.slice(0, metade), itens.slice(metade)];

      return (
        <div className={classesBase} data-tom="ouro" style={estilo}>
          <h2 className="slide-title av-sl-h2 av-sl-h2-linha slide-item">{slide.title}</h2>

          <div className="slide-grid-2 gap-[clamp(0.5rem,1.8cqw,1.1rem)] mt-[0.7em] slide-scroll">
            {colunas.map((coluna, indiceColuna) => (
              <div
                key={indiceColuna}
                className="slide-item av-sl-cartao space-y-[0.55em]"
                style={{ animationDelay: `${indiceColuna * 70}ms` }}
              >
                {coluna.map((item, idx) => (
                  <div key={idx} className="av-sl-lista-linha slide-body text-ink leading-relaxed">
                    <span className="av-sl-losango" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'revisao':
      return (
        <div className={classesBase} data-tom="salvia" style={estilo}>
          <span className="slide-label av-sl-rotulo slide-item">
            <Check className="w-[1.1em] h-[1.1em]" aria-hidden="true" />
            Síntese e pontos-chave
          </span>

          <h2 className="slide-title av-sl-h2 av-sl-h2-linha mt-[0.4em] slide-item">{slide.title}</h2>

          <div className="mt-[0.7em] space-y-[0.45em] slide-scroll">
            {itens.map((item, idx) => (
              <div
                key={idx}
                className="slide-item av-sl-revisao-item text-ink leading-relaxed"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="av-sl-check">
                  <Check className="w-[0.9em] h-[0.9em]" aria-hidden="true" />
                </span>
                <span className="slide-body font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'perguntas':
      return (
        <div className={classesBase} data-tom="terra" style={estilo}>
          <span className="slide-label av-sl-rotulo slide-item">
            <HelpCircle className="w-[1.1em] h-[1.1em]" aria-hidden="true" />
            Para fixação e reflexão
          </span>

          <h2 className="slide-title av-sl-h2 mt-[0.4em] slide-item">{slide.title}</h2>

          <ol className="mt-[0.7em] space-y-[0.5em] slide-scroll list-none">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="slide-item av-sl-cartao flex items-start gap-[0.7em]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="slide-body av-sl-num av-sl-num-escuro">{idx + 1}</span>
                <p className="slide-body text-ink font-medium leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'conteudo':
    default:
      return (
        <div className={classesBase} data-tom="ouro" style={estilo}>
          <h2 className="slide-title av-sl-h2 av-sl-h2-linha slide-item">{slide.title}</h2>

          <ul className="mt-[0.7em] space-y-[0.55em] slide-scroll list-none">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="slide-item av-sl-lista-linha slide-body text-ink leading-relaxed"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="av-sl-losango" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
