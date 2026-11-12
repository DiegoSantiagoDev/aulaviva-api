import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Brain, Volume2, BookOpen } from 'lucide-react';

const nodes = [
  { icon: Volume2, label: 'Áudio', sub: 'Gravação da aula' },
  { icon: ImageIcon, label: 'Imagens', sub: 'Fotos do quadro' },
  { icon: Brain, label: 'Servidor', sub: 'Spring Boot + IA' },
  { icon: BookOpen, label: 'Materiais', sub: 'Resumos e slides' },
];

export default function ProcessFlow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % (nodes.length + 1));
          }, 2000);
        } else if (interval) {
          clearInterval(interval);
        }
      });
    }, { threshold: 0.3 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => { obs.disconnect(); if (interval) clearInterval(interval); };
  }, []);

  return (
    <section className="relative py-24 px-6 bg-ink text-parchment overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl pulse-glow" />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-widest2 uppercase text-gold-soft font-semibold">O fluxo</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
            Do som ao <span className="shimmer-text">conhecimento</span>
          </h2>
          <p className="mt-4 text-parchment/70 max-w-xl mx-auto text-base">
            Cada etapa transporta a informação da sala de aula para o material didático final.
          </p>
        </div>

        {/* flow diagram */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-2">
          {nodes.map((n, i) => {
            const isActive = activeIdx === i || (activeIdx === nodes.length && i === nodes.length - 1);
            const isPassed = activeIdx > i;
            return (
              <div key={n.label} className="flex flex-col lg:flex-row items-center gap-6 lg:gap-2 w-full lg:w-auto">
                <div
                  className={`relative w-28 h-28 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
                    isActive ? 'scale-110 bg-gold text-ink shadow-2xl' : isPassed ? 'bg-parchment/10 text-gold-soft' : 'bg-parchment/5 text-parchment/40'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-gold ring-pulse" />
                  )}
                  <n.icon className="w-7 h-7" />
                  <span className="text-xs font-semibold">{n.label}</span>
                  <span className="text-[9px] opacity-70 text-center px-1">{n.sub}</span>
                </div>
                {i < nodes.length - 1 && (
                  <div className="relative w-full lg:w-24 h-12 lg:h-0.5 bg-parchment/10 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gold rounded-full transition-all duration-1000"
                      style={{ width: isPassed || isActive ? '100%' : '0%' }}
                    />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold ${isActive ? 'anim-marquee' : ''}`}
                      style={isActive ? { animationDuration: '1.5s' } : { opacity: 0 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* result callout */}
        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 rounded-full border border-gold/30 bg-parchment/5">
            <span className="text-sm text-gold-soft tracking-wide font-medium">
              {activeIdx >= nodes.length - 1 ? 'Resumos e slides prontos para o estudante' : 'Processando aula...'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
