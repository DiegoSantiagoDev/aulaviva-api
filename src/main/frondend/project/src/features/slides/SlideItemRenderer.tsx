import type { CSSProperties } from 'react';
import { SlideItem, SlideLayout } from '../../api/tipos';
import ArtFigure from '../../components/ArtFigure';
import { Check, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';

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

  const classesBase = `slide-layout h-full flex flex-col justify-center slide-pad ${
    denso ? 'slide-dense' : ''
  }`;

  switch (layout) {
    case 'capa':
      return (
        <div
          className="slide-layout h-full flex flex-col items-center justify-center text-center slide-pad gap-[clamp(0.6rem,2.5cqw,1.6rem)]"
          style={estilo}
        >
          <div className="w-[clamp(3.2rem,12cqw,7rem)] aspect-square">
            <ArtFigure pose="vitruvian" inView={true} className="w-full h-full text-ink" />
          </div>

          <span className="slide-label font-bold uppercase tracking-widest2 text-terra-deep px-[clamp(0.5rem,1.8cqw,1rem)] py-[clamp(0.12rem,0.6cqw,0.3rem)] rounded-full bg-gold/15">
            {disciplina}
          </span>

          <h2 className="slide-title-lg font-display font-bold text-ink leading-[1.08] max-w-[24ch] mx-auto">
            {slide.title}
          </h2>

          <div className="w-[clamp(3rem,10cqw,8rem)] h-px gold-line mx-auto" />

          {itens.length > 0 && (
            <p className="slide-subtitle font-display text-ink-soft italic max-w-[52ch] mx-auto">
              {itens[0]}
            </p>
          )}
        </div>
      );

    case 'definicao': {
      const primeiraFrase = itens[0] || slide.title;
      const letraInicial = primeiraFrase.charAt(0);
      const restoFrase = primeiraFrase.slice(1);
      const explicacao = itens.slice(1);

      return (
        <div className={classesBase} style={estilo}>
          <div className="slide-label flex items-center gap-2 font-semibold uppercase tracking-wider text-gold-deep slide-item">
            <Sparkles className="w-[1.1em] h-[1.1em] text-gold-deep" aria-hidden="true" />
            <span>Definição fundamental</span>
          </div>

          <h2 className="slide-title font-display font-bold text-ink border-b border-gold/30 pb-[0.35em] mt-[0.4em] slide-item">
            {slide.title}
          </h2>

          <div className="border-l-[0.28em] border-gold pl-[clamp(0.6rem,2cqw,1.4rem)] py-[0.4em] mt-[0.6em] bg-gold/5 rounded-r-2xl slide-item">
            <blockquote className="slide-quote font-display text-ink italic leading-[1.35]">
              <span className="font-display font-bold text-terra-deep mr-[0.12em] float-left text-[2.4em] leading-[0.8]">
                {letraInicial}
              </span>
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
        <div className={classesBase} style={estilo}>
          <div className="slide-label flex items-center gap-2 font-bold uppercase tracking-wider text-terra-deep slide-item">
            <span className="w-[0.55em] h-[0.55em] rounded-full bg-terra-deep" aria-hidden="true" />
            <span>Expressões e relações</span>
          </div>

          <h2 className="slide-title font-display font-bold text-ink mt-[0.4em] slide-item">
            {slide.title}
          </h2>

          <div className="slide-grid-2 gap-[clamp(0.4rem,1.5cqw,0.9rem)] mt-[0.8em] slide-scroll">
            {itens.map((expr, idx) => (
              <div
                key={idx}
                className="slide-item art-frame rounded-2xl px-[0.6em] py-[0.7em] text-center border border-gold/30 flex flex-col justify-center items-center shadow-sm"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="slide-formula font-display font-bold text-ink tracking-wide break-words text-center">
                  {expr}
                </span>
                <div className="w-[2.4em] h-[0.12em] bg-gold mt-[0.5em]" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'exemplo':
      return (
        <div className={classesBase} style={estilo}>
          <div className="slide-item">
            <span className="slide-label inline-flex items-center gap-1.5 px-[0.7em] py-[0.25em] rounded-full bg-terra-deep text-parchment font-bold uppercase tracking-wider shadow-sm">
              <Lightbulb className="w-[1.05em] h-[1.05em] text-gold-soft" aria-hidden="true" />
              <span>Exemplo prático</span>
            </span>
          </div>

          <h2 className="slide-title font-display font-bold text-ink mt-[0.45em] slide-item">
            {slide.title}
          </h2>

          <div
            className="slide-item art-frame rounded-2xl px-[clamp(0.6rem,2cqw,1.5rem)] py-[clamp(0.5rem,1.8cqw,1.2rem)] border-l-[0.3em] border-l-terra border border-gold/30 bg-parchment/80 mt-[0.7em] slide-scroll"
            style={{ animationDelay: '80ms' }}
          >
            <div className="space-y-[0.5em]">
              {itens.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-[0.6em] slide-item"
                  style={{ animationDelay: `${(idx + 2) * 50}ms` }}
                >
                  <span className="slide-body w-[1.5em] h-[1.5em] rounded-full bg-terra/15 text-terra-deep font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
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
        <div className={classesBase} style={estilo}>
          <h2 className="slide-title font-display font-bold text-ink border-b border-gold/30 pb-[0.3em] slide-item">
            {slide.title}
          </h2>

          <div className="slide-grid-2 gap-[clamp(0.5rem,1.8cqw,1.1rem)] mt-[0.7em] slide-scroll">
            {colunas.map((coluna, indiceColuna) => (
              <div
                key={indiceColuna}
                className="slide-item art-frame rounded-2xl px-[0.7em] py-[0.6em] border border-gold/25 space-y-[0.55em]"
                style={{ animationDelay: `${indiceColuna * 70}ms` }}
              >
                {coluna.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-[0.55em] slide-body text-ink leading-relaxed"
                  >
                    <span className="text-gold-deep font-bold mt-[0.15em]" aria-hidden="true">
                      ◆
                    </span>
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
        <div className={classesBase} style={estilo}>
          <div className="slide-label flex items-center gap-2 font-bold uppercase tracking-wider text-sage-deep slide-item">
            <Check className="w-[1.1em] h-[1.1em] text-sage-deep" aria-hidden="true" />
            <span>Síntese e pontos-chave</span>
          </div>

          <h2 className="slide-title font-display font-bold text-ink border-b border-gold/30 pb-[0.3em] mt-[0.4em] slide-item">
            {slide.title}
          </h2>

          <div className="mt-[0.7em] space-y-[0.45em] slide-scroll">
            {itens.map((item, idx) => (
              <div
                key={idx}
                className="slide-item flex items-start gap-[0.6em] px-[0.7em] py-[0.4em] rounded-xl bg-sage/10 border border-sage/25 text-ink leading-relaxed"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="w-[1.35em] h-[1.35em] rounded-full bg-sage-deep text-parchment flex items-center justify-center flex-shrink-0 mt-[0.1em]">
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
        <div className={classesBase} style={estilo}>
          <div className="slide-label flex items-center gap-2 font-bold uppercase tracking-wider text-terra-deep slide-item">
            <HelpCircle className="w-[1.1em] h-[1.1em] text-terra-deep" aria-hidden="true" />
            <span>Para fixação e reflexão</span>
          </div>

          <h2 className="slide-title font-display font-bold text-ink mt-[0.4em] slide-item">
            {slide.title}
          </h2>

          <ol className="mt-[0.7em] space-y-[0.5em] slide-scroll list-none">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="slide-item art-frame rounded-2xl px-[0.7em] py-[0.5em] border border-gold/30 flex items-start gap-[0.7em] shadow-sm"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="slide-body w-[1.6em] h-[1.6em] rounded-full bg-ink text-gold-soft font-display font-bold flex items-center justify-center flex-shrink-0 mt-[0.05em]">
                  {idx + 1}
                </span>
                <p className="slide-body text-ink font-medium leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'conteudo':
    default:
      return (
        <div className={classesBase} style={estilo}>
          <h2 className="slide-title font-display font-bold text-ink border-b border-gold/30 pb-[0.3em] slide-item">
            {slide.title}
          </h2>

          <ul className="mt-[0.7em] space-y-[0.55em] slide-scroll list-none">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="slide-item flex items-start gap-[0.65em] slide-body text-ink leading-relaxed"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span
                  className="text-gold-deep font-bold leading-none mt-[0.25em] flex-shrink-0"
                  aria-hidden="true"
                >
                  ◆
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
