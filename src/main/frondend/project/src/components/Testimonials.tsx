import { Quote } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const testimonials = [
  {
    quote: 'Nunca pensei que aprender matemática pudesse parecer um passeio por um museu. As animações com referências artísticas me fizeram lembrar de cada conceito.',
    name: 'Helena Vasconcelos',
    role: 'Estudante de Arquitetura',
  },
  {
    quote: 'O personagem que se transforma nas obras mudou minha forma de ensinar. Meus alunos chegam falando de Michelangelo e Míron na aula de física.',
    name: 'Prof. Adriano Lobo',
    role: 'Educador · 12 anos de sala',
  },
  {
    quote: 'Senti que cada módulo era uma sala de exposição. Eu queria terminar só para ver qual obra viria a seguir.',
    name: 'Marina Tsukino',
    role: 'Designer',
  },
];

function Card({ t, i }: { t: (typeof testimonials)[number]; i: number }) {
  const { ref, inView } = useReveal(0.3);
  return (
    <figure
      ref={ref as never}
      className={`reveal ${inView ? 'in-view' : ''} art-frame rounded-2xl p-8 flex flex-col`}
      style={{ transitionDelay: `${i * 120}ms` }}
    >
      <Quote className="w-8 h-8 text-gold/60" />
      <blockquote className="mt-4 font-display text-xl leading-relaxed text-ink flex-1">
        "{t.quote}"
      </blockquote>
      <figcaption className="mt-6 pt-6 border-t border-gold/20">
        <div className="font-semibold text-ink">{t.name}</div>
        <div className="text-sm text-ink-soft">{t.role}</div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section className="py-24 px-6 bg-parchment paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">Vozes do ateliê</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            Quem já passou por aqui
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
