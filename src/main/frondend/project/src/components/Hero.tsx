import { useEffect, useState } from 'react';
import { ArrowDown, Mic, Sparkles } from 'lucide-react';
import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';

export default function Hero() {
  const { ref, inView } = useReveal(0.2);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden paper-grain">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 35%, #f8f2e7 0%, #ece3d0 55%, #d9cdb4 100%)' }}
      />

      {/* concentric rotating rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-gold/20 anim-rotate-slow" />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[520px] h-[520px] rounded-full border border-gold/15 anim-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '80s' }} />
      </div>

      {/* floating blobs */}
      <div className="absolute top-[18%] left-[12%] w-24 h-24 rounded-full bg-terra/10 anim-float-soft" />
      <div className="absolute bottom-[22%] right-[14%] w-32 h-32 rounded-full bg-sage/15 anim-float" />
      <div className="absolute top-[30%] right-[22%] w-3 h-3 rounded-full bg-gold anim-breathe" />

      {/* audio waveform decoration */}
      <div className="absolute bottom-20 left-10 flex items-end gap-1 h-12 opacity-40 hidden md:flex">
        {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3, 0.6, 0.5].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-ink rounded-full wave-bar"
            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-28 pb-20">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 bg-parchment/60 backdrop-blur-sm anim-fade-up">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs tracking-widest2 uppercase text-ink-soft">Sistema inteligente de apoio à aprendizagem</span>
          </div>

          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mt-6 anim-fade-up delay-200">
            <span className="block text-ink">Aula</span>
            <span className="block shimmer-text">Viva</span>
          </h1>

          <p className="mt-6 font-display text-2xl md:text-3xl italic text-terra-deep anim-fade-up delay-300">
            "Nenhuma aula precisa ser perdida."
          </p>

          <p className="mt-4 text-lg text-ink-soft max-w-md mx-auto lg:mx-0 anim-fade-up delay-400">
            O áudio e as imagens das aulas viram materiais de estudo organizados com inteligência
            artificial. Recupere, revise e prepare-se — no seu próprio ritmo.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start anim-fade-up delay-500">
            <button className="ink-btn px-8 py-3.5 rounded-full font-medium tracking-wide">
              Conhecer o sistema
            </button>
            <button className="px-8 py-3.5 rounded-full border border-ink/30 text-ink hover:bg-ink/5 transition-all duration-300 font-medium tracking-wide">
              Como funciona
            </button>
          </div>
        </div>

        {/* figure column — Scholar pose: student studying */}
        <div className="relative flex justify-center anim-scale-in delay-300" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="art-frame rounded-2xl p-8 anim-float">
            <ArtFigure pose="scholar" inView={inView} className="w-72 h-72 md:w-96 md:h-96" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs tracking-widest2 uppercase text-ink-soft bg-parchment px-3 py-1 rounded-full border border-gold/30 whitespace-nowrap">
              Vermeer · A leitora
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-soft anim-fade-up delay-700">
        <span className="text-xs tracking-widest2 uppercase">Role para descobrir</span>
        <ArrowDown className="w-4 h-4 anim-float" />
      </div>
    </section>
  );
}
