import { Camera, Cpu, MonitorPlay } from 'lucide-react';
import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';

const stages = [
  {
    icon: Camera,
    title: '1. Captura',
    subtitle: 'Durante a aula',
    desc: 'O ESP32 com microfone INMP441 capta o áudio da sala pela interface I2S. O professor fotografa o quadro, slides e exercícios pelo celular e envia à plataforma.',
    pose: 'discobolus' as const,
    artRef: 'Míron · Discóbolo',
    color: 'terra',
  },
  {
    icon: Cpu,
    title: '2. Processamento',
    subtitle: 'No servidor',
    desc: 'O backend em Spring Boot recebe os arquivos, registra os metadados e aciona a IA: transcrição do áudio, análise do conteúdo e geração de resumos, questões e exercícios.',
    pose: 'scribe' as const,
    artRef: 'São Jerônimo · O escriba',
    color: 'gold',
  },
  {
    icon: MonitorPlay,
    title: '3. Plataforma',
    subtitle: 'Para alunos e professores',
    desc: 'Cada aula vira materiais organizados por turma, disciplina e data. O aluno consulta no seu ritmo; o professor revisa e valida antes de publicar.',
    pose: 'scholar' as const,
    artRef: 'Vermeer · A leitora',
    color: 'sage',
  },
];

function Stage({ s, i }: { s: (typeof stages)[number]; i: number }) {
  const { ref, inView } = useReveal(0.25);
  const colorMap: Record<string, string> = {
    terra: 'text-terra bg-terra/10',
    gold: 'text-gold bg-gold/10',
    sage: 'text-sage bg-sage/10',
  };
  return (
    <div ref={ref as never} className={`reveal ${inView ? 'in-view' : ''} relative`}>
      <div className="art-frame rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
            <s.icon className="w-7 h-7" />
          </div>
          <span className="font-display text-6xl text-gold/25">{i + 1}</span>
        </div>
        <h3 className="font-display text-3xl font-semibold mt-4 text-ink">{s.title}</h3>
        <p className="text-sm tracking-widest2 uppercase text-ink-soft mt-1">{s.subtitle}</p>
        <p className="mt-4 text-ink-soft leading-relaxed">{s.desc}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <ArtFigure pose={s.pose} inView={inView} className="w-full h-full" />
          </div>
          <span className="text-xs tracking-widest2 uppercase text-gold/70">{s.artRef}</span>
        </div>
      </div>
      {i < stages.length - 1 && (
        <div className="hidden lg:flex absolute top-1/2 -right-6 z-10 items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gold anim-breathe" />
        </div>
      )}
    </div>
  );
}

export default function HowItWorks() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section id="funcionamento" className="relative py-24 px-6 paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">O funcionamento</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            Da sala de aula à tela
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto">
            Em três etapas, o conteúdo vivo da aula é transformado em materiais de estudo
            que ficam disponíveis para consulta quando e onde o aluno precisar.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {stages.map((s, i) => (
            <Stage key={s.title} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
