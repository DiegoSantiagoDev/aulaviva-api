import { Camera, CheckCircle2, Clock, Upload, LucideIcon } from 'lucide-react';
import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    icon: Camera,
    title: 'Fotografe o quadro',
    desc: 'Quadro, slides, exercícios, diagramas — tudo o que foi usado na explicação.',
  },
  {
    icon: Upload,
    title: 'Envie à plataforma',
    desc: 'Associe as imagens à turma, disciplina e aula correspondente em poucos toques.',
  },
  {
    icon: CheckCircle2,
    title: 'Revise os materiais',
    desc: 'Veja os resumos e slides gerados pela IA. Aprove, ajuste ou reprocesse antes de publicar.',
  },
];

const reviewItems = [
  { type: 'Resumo', status: 'Aprovado', text: 'Resumo: Equação do 2º grau' },
  { type: 'Slides', status: 'Aprovado', text: 'Apresentação com 8 slides didáticos' },
  { type: 'Vídeo', status: 'Revisar', text: 'Guia do NotebookLM para os alunos' },
];

const statusColor: Record<string, string> = {
  Aprovado: 'bg-sage/20 text-sage',
  Revisar: 'bg-gold/20 text-gold-soft',
};

function StepItem({ s, i, total }: { s: Step; i: number; total: number }) {
  const { ref, inView } = useReveal(0.3);
  return (
    <div
      ref={ref as never}
      className={`reveal ${inView ? 'in-view' : ''} flex gap-5 items-start`}
      style={{ transitionDelay: `${i * 120}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-gold-soft">
          <s.icon className="w-6 h-6" />
        </div>
        {i < total - 1 && <div className="w-px h-12 bg-gold/20 mt-2" />}
      </div>
      <div className="pt-1">
        <h3 className="font-display text-2xl font-semibold text-parchment">{s.title}</h3>
        <p className="text-parchment/70 mt-1 text-sm">{s.desc}</p>
      </div>
    </div>
  );
}

export default function TeacherArea() {
  const { ref, inView } = useReveal(0.15);

  return (
    <section className="relative py-24 px-6 bg-ink text-parchment overflow-hidden">
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full border border-gold/20 anim-rotate-slow" />
      <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full border border-gold/15 anim-rotate-slow" style={{ animationDirection: 'reverse' }} />

      <div className="relative max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold-soft">Participação do professor</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3">
            O professor no <span className="shimmer-text">centro</span>
          </h2>
          <p className="mt-4 text-parchment/70 max-w-2xl mx-auto">
            Os professores enviam áudios e imagens, acompanham os conteúdos e revisam os materiais
            produzidos pela IA antes que cheguem aos estudantes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* steps */}
          <div className="space-y-6">
            {steps.map((s, i) => (
              <StepItem key={s.title} s={s} i={i} total={steps.length} />
            ))}
          </div>

          {/* review panel mockup */}
          <div className={`reveal ${inView ? 'in-view' : ''} rounded-2xl p-6`} style={{ background: 'rgba(245,239,228,0.06)', boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.25)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-xl text-parchment">Revisão de materiais</h4>
              <span className="flex items-center gap-1 text-xs text-gold-soft">
                <Clock className="w-3 h-3" /> Pendentes: 1
              </span>
            </div>
            <div className="space-y-3">
              {reviewItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl slide-fade"
                  style={{ animationDelay: `${i * 0.15}s`, background: 'rgba(245,239,228,0.04)' }}
                >
                  <span className="text-[10px] tracking-wide uppercase text-gold-soft font-semibold w-16">{item.type}</span>
                  <span className="text-sm text-parchment/80 flex-1 truncate">{item.text}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusColor[item.status]}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <a
              href="#/professor"
              className="block text-center w-full mt-5 py-2.5 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-soft transition-all duration-300 shadow-md"
            >
              Acessar painel do professor
            </a>
          </div>
        </div>

        {/* aggregated insights note */}
        <div className="mt-16 flex items-center justify-center gap-6">
          <div className="w-20 h-20 opacity-70 flex-shrink-0">
            <ArtFigure pose="scribe" inView={inView} className="w-full h-full [&_line]:stroke-parchment [&_circle]:stroke-parchment [&_path]:stroke-parchment" />
          </div>
          <p className="text-sm text-parchment/60 italic max-w-md">
            No futuro, indicadores agregados podem mostrar quais assuntos apresentam maior
            dificuldade para a turma — sempre com cuidado pedagógico e respeito à privacidade.
          </p>
        </div>
      </div>
    </section>
  );
}
