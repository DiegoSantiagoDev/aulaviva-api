import { useReveal } from '../hooks/useReveal.ts';
import EmblemaBoasVindas from './EmblemaBoasVindas';
import { useRoteador } from '../app/Roteador';
import { Sparkles } from 'lucide-react';
import './institucional.css';

export default function Hero() {
  const { ref, inView } = useReveal(0.1);
  const selo = useReveal(0.3);
  const { navegar } = useRoteador();

  return (
    <section className="av-inst-hero paper-grain" aria-labelledby="hero-titulo">
      <div className="av-inst-hero-grade">
        <div ref={ref} className={`av-inst-hero-texto reveal-scale ${inView ? 'in-view' : ''}`}>
          <p className="av-inst-chamada">
            <Sparkles className="anim-breathe" aria-hidden="true" />
            <span>Recuperação de aulas com inteligência artificial</span>
          </p>

          <h1 id="hero-titulo" className="av-inst-hero-titulo">
            Aulas que não se perdem. <br />
            <span className="shimmer-text italic font-normal">Aulas que ganham vida.</span>
          </h1>

          <p className="av-inst-hero-lead">
            Perdeu a aula? O AulaViva transforma áudio e fotos do quadro em resumos didáticos, apresentações de slides dinâmicas e roteiros para vídeos explicativos no Google NotebookLM.
          </p>

          <div className="av-inst-hero-acoes">
            <button
              type="button"
              onClick={() => navegar('/entrar')}
              className="av-btn av-btn-primario av-btn-lg"
            >
              Entrar na plataforma
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('funcionamento');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="av-btn av-btn-contorno av-btn-lg"
            >
              Conhecer o projeto
            </button>
          </div>
        </div>

        {/* Emblema original: traço que se desenha, anel que gira e ponto que pulsa */}
        <div ref={selo.ref} className="av-inst-hero-selo-wrap anim-float-soft">
          <div className="av-inst-hero-selo">
            <EmblemaBoasVindas inView={selo.inView} className="av-inst-hero-emblema" />
          </div>
        </div>
      </div>
    </section>
  );
}
