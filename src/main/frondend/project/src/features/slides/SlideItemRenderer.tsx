import { SlideItem, SlideLayout } from '../../api/tipos';
import ArtFigure from '../../components/ArtFigure';
import { Check, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';

interface SlideItemRendererProps {
  slide: SlideItem;
  layout: SlideLayout;
  disciplina: string;
}

export default function SlideItemRenderer({
  slide,
  layout,
  disciplina,
}: SlideItemRendererProps) {
  const itens = slide.content || [];

  switch (layout) {
    case 'capa':
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto anim-breathe">
            <ArtFigure pose="vitruvian" inView={true} className="w-full h-full text-ink" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest2 text-terra font-bold px-3 py-1 rounded-full bg-gold/15">
              {disciplina}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-ink mt-3 leading-tight max-w-2xl mx-auto">
              {slide.title}
            </h2>
          </div>
          <div className="w-24 h-px gold-line mx-auto" />
          {itens.length > 0 && (
            <p className="font-display text-base sm:text-xl text-ink-soft italic max-w-xl mx-auto">
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
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
            <Sparkles className="w-4 h-4 text-gold anim-breathe" />
            <span>Definição Fundamental</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink border-b border-gold/20 pb-3">
            {slide.title}
          </h2>

          <div className="border-l-4 border-gold pl-6 py-2 bg-gold/5 rounded-r-2xl">
            <blockquote className="font-display text-xl sm:text-3xl text-ink italic leading-relaxed">
              <span className="font-serif text-3xl sm:text-5xl font-bold text-terra mr-1 float-left leading-none">
                {letraInicial}
              </span>
              {restoFrase}
            </blockquote>
          </div>

          {explicacao.length > 0 && (
            <div className="space-y-2 pt-2">
              {explicacao.map((item, idx) => (
                <p key={idx} className="text-sm sm:text-base text-ink-soft leading-relaxed">
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
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terra">
            <span className="w-2 h-2 rounded-full bg-terra" />
            <span>Expressões e Relações Algébricas</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink">
            {slide.title}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {itens.map((expr, idx) => (
              <div
                key={idx}
                className="art-frame rounded-2xl p-6 text-center border border-gold/30 hover:border-gold transition-all duration-300 flex flex-col justify-center items-center shadow-md"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-wide">
                  {expr}
                </span>
                <div className="w-12 h-0.5 bg-gold mt-3" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'exemplo':
      return (
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terra text-parchment text-xs font-bold uppercase tracking-wider shadow-sm">
              <Lightbulb className="w-3.5 h-3.5 text-gold-soft" />
              <span>Exemplo Prático</span>
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink">
            {slide.title}
          </h2>

          <div className="art-frame rounded-2xl p-6 sm:p-8 border-l-4 border-l-terra border border-gold/30 space-y-3.5 bg-parchment/80">
            {itens.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-terra/15 text-terra font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm sm:text-base text-ink leading-relaxed font-sans">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'duas-colunas': {
      const metade = Math.ceil(itens.length / 2);
      const col1 = itens.slice(0, metade);
      const col2 = itens.slice(metade);

      return (
        <div className="h-full flex flex-col justify-center p-6 sm:p-10 space-y-6">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink border-b border-gold/20 pb-3">
            {slide.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="art-frame rounded-2xl p-5 border border-gold/25 space-y-3">
              {col1.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-ink leading-relaxed">
                  <span className="text-gold font-bold mt-1">◆</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="art-frame rounded-2xl p-5 border border-gold/25 space-y-3">
              {col2.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-ink leading-relaxed">
                  <span className="text-gold font-bold mt-1">◆</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'revisao':
      return (
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage">
            <Check className="w-4 h-4 text-sage" />
            <span>Síntese e Pontos-Chave</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink border-b border-gold/20 pb-3">
            {slide.title}
          </h2>

          <div className="space-y-3 pt-2">
            {itens.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-sage/10 border border-sage/20 text-ink leading-relaxed"
              >
                <div className="w-5 h-5 rounded-full bg-sage text-parchment flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm sm:text-base font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'perguntas':
      return (
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terra">
            <HelpCircle className="w-4 h-4 text-terra" />
            <span>Para Fixação e Reflexão</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink">
            {slide.title}
          </h2>

          <div className="space-y-3.5 pt-2">
            {itens.map((item, idx) => (
              <div
                key={idx}
                className="art-frame rounded-2xl p-4 sm:p-5 border border-gold/30 hover:border-gold transition-colors flex items-start gap-3.5 shadow-sm"
              >
                <span className="w-6 h-6 rounded-full bg-ink text-gold font-display font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  ?
                </span>
                <p className="text-sm sm:text-base text-ink font-medium leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'conteudo':
    default:
      return (
        <div className="h-full flex flex-col justify-center p-6 sm:p-12 space-y-6">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink border-b border-gold/25 pb-3">
            {slide.title}
          </h2>

          <ul className="space-y-3.5 pt-2">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3.5 text-base sm:text-lg text-ink leading-relaxed"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <span className="text-gold font-bold text-lg leading-none mt-1 flex-shrink-0">
                  ◆
                </span>
                <span className="font-sans font-normal">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}
