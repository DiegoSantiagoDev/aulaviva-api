import ArtFigure from './ArtFigure';
import { useReveal } from '../hooks/useReveal';

export default function CTA() {
  const { ref, inView } = useReveal(0.25);
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-terra-deep text-parchment">
      <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(201,162,39,0.4), transparent 60%)' }} />
      <div className="absolute top-10 right-10 w-40 h-40 rounded-full border border-gold/20 anim-rotate-slow" />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full border border-gold/15 anim-rotate-slow" style={{ animationDirection: 'reverse' }} />

      <div ref={ref} className={`relative max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center reveal ${inView ? 'in-view' : ''}`}>
        <div>
          <span className="text-xs tracking-widest2 uppercase text-gold-soft">O resultado esperado</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 leading-tight">
            Mais aprendizagem para todos
          </h2>
          <p className="mt-4 font-display text-2xl italic text-gold-soft">
            "Nenhuma aula precisa ser perdida."
          </p>
          <p className="mt-6 text-parchment/80 max-w-md">
            Para os alunos, uma forma mais acessível de recuperar explicações e praticar.
            Para os professores, facilitação na disponibilização de materiais.
            Para a escola, apoio à recuperação da aprendizagem.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="px-8 py-3.5 rounded-full bg-gold text-ink font-medium tracking-wide hover:bg-gold-soft transition-all duration-300 hover:-translate-y-1">
              Acompanhar o projeto
            </button>
            <button className="px-8 py-3.5 rounded-full border border-parchment/40 text-parchment hover:bg-parchment/10 transition-all duration-300 font-medium tracking-wide">
              Falar com a equipe
            </button>
          </div>
        </div>
        <div className="flex justify-center anim-float">
          <div className="rounded-2xl p-8" style={{ background: 'rgba(245,239,228,0.08)', boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.3)' }}>
            <ArtFigure pose="nike" inView={inView} className="w-64 h-64 md:w-72 md:h-72 [&_line]:stroke-parchment [&_circle]:stroke-parchment [&_path]:stroke-parchment" />
            <div className="text-center mt-2 text-[10px] tracking-widest2 uppercase text-gold-soft">
              Vitória de Samotrácia
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
