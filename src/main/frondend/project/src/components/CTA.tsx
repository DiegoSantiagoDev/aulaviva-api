import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';
import { useRoteador } from '../app/Roteador';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const { ref, inView } = useReveal(0.2);
  const { navegar } = useRoteador();

  return (
    <section className="py-28 px-6 bg-parchment relative overflow-hidden paper-grain">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`}>
          <div className="w-32 h-32 mx-auto mb-6">
            <ArtFigure pose="nike" inView={inView} className="w-32 h-32" />
          </div>
          <span className="text-xs tracking-widest2 uppercase text-gold font-semibold">
            Demonstração Aberta
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mt-3 text-ink leading-tight">
            Pronto para ver as aulas <br />
            <span className="shimmer-text">ganharem vida?</span>
          </h2>
          <p className="mt-5 text-ink-soft text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Experimente a plataforma agora mesmo. Acesse a biblioteca de aulas como aluno ou explore o painel do professor.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navegar('/entrar')}
              className="ink-btn px-8 py-4 rounded-full text-base font-semibold inline-flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              <span>Acessar a Plataforma</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('funcionamento');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="gold-outline-btn px-8 py-4 rounded-full text-base font-semibold w-full sm:w-auto"
            >
              Entenda como funciona
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
