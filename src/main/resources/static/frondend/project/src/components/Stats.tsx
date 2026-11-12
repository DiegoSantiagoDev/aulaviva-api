import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';

const stats = [
  { value: 12000, label: 'Alunos ativos', suffix: '+' },
  { value: 340, label: 'Trilhas disponíveis', suffix: '' },
  { value: 98, label: 'Satisfação', suffix: '%' },
  { value: 27, label: 'Artistas-parceiros', suffix: '' },
];

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(end * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl font-bold text-ink">
      {val.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

export default function Stats() {
  const { ref, inView } = useReveal(0.2);
  return (
    <section className="py-24 px-6 paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink">A escola em números</h2>
          <div className="h-px gold-line w-24 mx-auto mt-6" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <div className="transition-transform duration-500 group-hover:scale-110">
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-ink-soft text-sm tracking-widest2 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
