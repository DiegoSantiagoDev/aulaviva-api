import { useReveal } from '../hooks/useReveal.ts';

interface Milestone {
  label: string;
  desc: string;
}

const milestones: Milestone[] = [
  { label: 'API inicial com Spring Boot', desc: 'Estruturação dos serviços de aula, status e armazenamento.' },
  { label: 'Recebimento de áudio (PC)', desc: 'Envio de gravações com progresso real e validações de cliente.' },
  { label: 'Comunicação Wi-Fi', desc: 'Conexão entre dispositivos locais e o servidor da rede.' },
  { label: 'Integrar INMP441', desc: 'Captura acústica e transmissão em blocos (fase futura).' },
  { label: 'Envio de imagens', desc: 'Professor fotografa o quadro com compressão inteligente no navegador.' },
  { label: 'Organização dos dados', desc: 'Estruturação por disciplina, data e agrupamento alfabético.' },
  { label: 'Integração da IA', desc: 'Transcrição via Whisper e geração de resumos e slides via Qwen (exercícios em breve).' },
  { label: 'Plataforma de acesso', desc: 'Interface única para alunos e professores com design clássico e acessível.' },
  { label: 'Testes em ambiente real', desc: 'Validação do fluxo durante apresentações e feiras escolares.' },
];

function MilestoneItem({ m, i }: { m: Milestone; i: number }) {
  const { ref, inView } = useReveal(0.3);
  const left = i % 2 === 0;

  return (
    <div
      ref={ref as never}
      className={`reveal ${inView ? 'in-view' : ''} relative flex items-center gap-6 ${
        left ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* node */}
      <div className="absolute left-5 md:left-1/2 -translate-x-1/2 z-10">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-500 ${
            inView
              ? 'bg-ink text-parchment node-pop'
              : 'bg-parchment border-2 border-gold/40 text-gold'
          }`}
        >
          {i + 1}
        </div>
      </div>

      {/* spacer for mobile alignment */}
      <div className="w-10 flex-shrink-0 md:hidden" />

      {/* card */}
      <div className={`flex-1 ${left ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
        <div className="art-frame rounded-xl p-5 inline-block w-full transition-all duration-500 hover:shadow-xl">
          <h3 className="font-display text-xl font-semibold text-ink">{m.label}</h3>
          <p className="text-sm text-ink-soft mt-1">{m.desc}</p>
        </div>
      </div>

      <div className="hidden md:block flex-1" />
    </div>
  );
}

export default function Roadmap() {
  const { ref, inView } = useReveal(0.1);
  return (
    <section id="etapas" className="relative py-24 px-6 bg-parchment paper-grain">
      <div className="max-w-4xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">Etapas previstas</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            O caminho do projeto
          </h2>
          <p className="mt-4 text-ink-soft max-w-xl mx-auto">
            Nove etapas planejadas, do backend inicial aos testes em aulas reais.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gold/30 md:-translate-x-1/2" />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <MilestoneItem key={m.label} m={m} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
