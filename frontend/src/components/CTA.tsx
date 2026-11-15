import EmblemaPortal from './EmblemaPortal';
import { useReveal } from '../hooks/useReveal.ts';
import { useRoteador } from '../app/Roteador';
import './institucional.css';

export default function CTA() {
  const { ref, inView } = useReveal(0.2);
  const { navegar } = useRoteador();

  return (
    <section className="av-inst-cta paper-grain" aria-labelledby="cta-titulo">
      <div className="av-inst-cta-in">
        <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`}>
          <EmblemaPortal inView={inView} className="av-inst-cta-emblema" />
          <h2 id="cta-titulo" className="av-inst-cta-titulo">
            Pronto para ver as aulas <br />
            <span className="shimmer-text">ganharem vida?</span>
          </h2>
          <p className="av-inst-cta-lead">
            Experimente a plataforma agora mesmo. Acesse a biblioteca de aulas como aluno ou explore o painel do
            professor.
          </p>
          <div className="av-inst-cta-acoes">
            <button type="button" onClick={() => navegar('/entrar')} className="av-btn av-btn-primario av-btn-lg">
              Acessar a plataforma
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('funcionamento');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="av-btn av-btn-contorno av-btn-lg"
            >
              Entenda como funciona
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
