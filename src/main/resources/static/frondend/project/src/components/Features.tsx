import { BookOpen, Compass, Palette, Users } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const features = [
  {
    icon: BookOpen,
    title: 'Trilhas curadas',
    desc: 'Cursos estruturados como roteiros de museu — cada etapa revela a próxima.',
  },
  {
    icon: Palette,
    title: 'Aulas visuais',
    desc: 'Animações inspiradas em obras-primas tornam cada conceito memorável.',
  },
  {
    icon: Compass,
    title: 'Aprenda no seu ritmo',
    desc: 'Pausa, reveja e avance. O conhecimento não tem pressa — nem os mestres tinham.',
  },
  {
    icon: Users,
    title: 'Comunidade de ateliê',
    desc: 'Tire dúvidas e compartilhe exercícios como em um verdadeiro atelier renascentista.',
  },
];

function Card({ f, i }: { f: (typeof features)[number]; i: number }) {
  const { ref, inView } = useReveal(0.3);
  return (
    <div
      ref={ref as never}
      className={`reveal ${inView ? 'in-view' : ''} group art-frame rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
      style={{ transitionDelay: `${i * 80}ms` }}
    >
      <div className="w-14 h-14 rounded-xl bg-ink flex items-center justify-center transition-all duration-500 group-hover:bg-terra group-hover:rotate-6">
        <f.icon className="w-7 h-7 text-parchment" />
      </div>
      <h3 className="font-display text-2xl font-semibold mt-6 text-ink">{f.title}</h3>
      <p className="mt-3 text-ink-soft leading-relaxed">{f.desc}</p>
      <div className="h-px w-12 gold-line mt-6 group-hover:w-full transition-all duration-700" />
    </div>
  );
}

export default function Features() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section className="relative py-24 px-6 bg-ink text-parchment overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/10 blur-3xl pulse-glow" />
      <div className="relative max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold-soft">O método</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3">
            Aprender como quem pinta uma <span className="shimmer-text">obra-prima</span>
          </h2>
          <p className="mt-4 text-parchment/70 max-w-xl mx-auto">
            Quatro pilares que transformam o estudo em uma experiência digna de galeria.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Card key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
