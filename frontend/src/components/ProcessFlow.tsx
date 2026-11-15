import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Brain, Volume2, BookOpen } from 'lucide-react';
import './institucional.css';

const nodes = [
  { icon: Volume2, label: 'Áudio', sub: 'Gravação da aula' },
  { icon: ImageIcon, label: 'Imagens', sub: 'Fotos do quadro' },
  { icon: Brain, label: 'Servidor', sub: 'Spring Boot + IA' },
  { icon: BookOpen, label: 'Materiais', sub: 'Resumos e slides' },
];

export default function ProcessFlow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const parar = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // Evita criar dois temporizadores se a seção reaparecer
          if (!interval) {
            interval = setInterval(() => {
              setActiveIdx((prev) => (prev + 1) % (nodes.length + 1));
            }, 2000);
          }
        } else {
          parar();
        }
      });
    }, { threshold: 0.3 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => { obs.disconnect(); parar(); };
  }, []);

  return (
    <section ref={sectionRef} className="av-inst-fluxo" aria-labelledby="fluxo-titulo">
      <div className="av-inst-fluxo-halo pulse-glow" aria-hidden="true" />

      <div className="av-inst-fluxo-in">
        <div className="av-inst-secao-topo">
          <h2 id="fluxo-titulo" className="av-inst-fluxo-titulo">
            <span className="av-inst-brilho-noite">Do som ao conhecimento</span>
          </h2>
          <p className="av-inst-fluxo-lead">
            Cada etapa transporta a informação da sala de aula para o material didático final.
          </p>
        </div>

        {/* Diagrama do fluxo: o estado é só visual, a lista descreve as quatro etapas */}
        <ol className="av-inst-fluxo-lista" aria-label="Etapas do fluxo">
          {nodes.map((n, i) => {
            const isActive = activeIdx === i || (activeIdx === nodes.length && i === nodes.length - 1);
            const isPassed = activeIdx > i;
            const estado = isActive ? 'ativo' : isPassed ? 'passado' : 'espera';
            return (
              <li key={n.label}>
                <div className="av-inst-no" data-estado={estado}>
                  {isActive && <div className="av-inst-no-anel" aria-hidden="true" />}
                  <n.icon aria-hidden="true" />
                  <span className="av-inst-no-nome">{n.label}</span>
                  <span className="av-inst-no-sub">{n.sub}</span>
                </div>
                {i < nodes.length - 1 && (
                  <div
                    className="av-inst-liga"
                    data-cheia={isPassed || isActive}
                    data-ativa={isActive}
                    aria-hidden="true"
                  >
                    <div className="av-inst-liga-preenche" />
                    <div className="av-inst-liga-ponto" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="av-inst-fluxo-resultado">
          <p className="av-inst-fluxo-aviso">
            {activeIdx >= nodes.length - 1 ? 'Resumos e slides prontos para o estudante' : 'Processando aula...'}
          </p>
        </div>
      </div>
    </section>
  );
}
