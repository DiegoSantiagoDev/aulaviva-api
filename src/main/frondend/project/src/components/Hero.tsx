import { useReveal } from '../hooks/useReveal.ts';
import ArtFigure from './ArtFigure.tsx';
import { useRoteador } from '../app/Roteador';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const { ref, inView } = useReveal(0.1);
  const { navegar } = useRoteador();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-6 paper-grain overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div ref={ref} className={`reveal-scale ${inView ? 'in-view' : ''}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-ink-soft text-xs mb-8">
            <Sparkles className="w-3.5 h-3.5 text-gold anim-breathe" />
            <span className="tracking-widest2 uppercase text-ink font-medium">Recuperação de Aulas com Inteligência Artificial</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-ink leading-[1.08] max-w-4xl mx-auto">
            Aulas que não se perdem. <br />
            <span className="shimmer-text italic font-normal">Aulas que ganham vida.</span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Perdeu a aula? O AulaViva transforma áudio e fotos do quadro em resumos didáticos, apresentações de slides dinâmicas e roteiros para vídeos explicativos no Google NotebookLM.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navegar('/entrar')}
              className="ink-btn px-8 py-4 rounded-full text-base font-semibold inline-flex items-center gap-2.5 group w-full sm:w-auto justify-center shadow-lg"
            >
              <span>Entrar na Plataforma</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('funcionamento');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="gold-outline-btn px-8 py-4 rounded-full text-base font-semibold w-full sm:w-auto"
            >
              Conhecer o Projeto
            </button>
          </div>
        </div>

        {/* Figura de arte animada no Hero */}
        <div className="mt-14 max-w-xs mx-auto anim-float-soft">
          <ArtFigure pose="vitruvian" inView={inView} className="w-48 h-48 mx-auto" />
        </div>
      </div>
    </section>
  );
}
