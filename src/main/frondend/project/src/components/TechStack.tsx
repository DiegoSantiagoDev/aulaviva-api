import { Cpu, Mic, Wifi, Smartphone, Server, Database, BrainCircuit, MonitorSmartphone, LucideIcon } from 'lucide-react';
import { useReveal } from '../hooks/useReveal.ts';

interface TechItem {
  icon: LucideIcon;
  name: string;
  use: string;
}

const tech: TechItem[] = [
  { icon: Cpu, name: 'ESP32 DevKit V1', use: 'Controle da captura e comunicação do áudio' },
  { icon: Mic, name: 'INMP441', use: 'Captação digital de áudio por I2S' },
  { icon: Wifi, name: 'Wi-Fi Local', use: 'Comunicação direta em rede local com o servidor' },
  { icon: Smartphone, name: 'Celular do professor', use: 'Captura e compressão de imagens no navegador' },
  { icon: Server, name: 'Java + Spring Boot', use: 'Backend robusto, API REST e pipelines de IA' },
  { icon: Database, name: 'PostgreSQL', use: 'Persistência de dados das aulas e metadados' },
  { icon: BrainCircuit, name: 'Whisper + Qwen (Groq)', use: 'Transcrição e síntese didática estruturada' },
  { icon: MonitorSmartphone, name: 'React 18 + Tailwind', use: 'Interface acessível, responsiva e offline' },
];

function TechCard({ t, i }: { t: TechItem; i: number }) {
  const { ref, inView } = useReveal(0.3);
  return (
    <div
      ref={ref as never}
      className={`reveal ${inView ? 'in-view' : ''} group art-frame rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
      style={{ transitionDelay: `${i * 70}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center transition-all duration-500 group-hover:bg-terra group-hover:rotate-6">
        <t.icon className="w-6 h-6 text-parchment" />
      </div>
      <h3 className="font-display text-xl font-semibold mt-4 text-ink">{t.name}</h3>
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">{t.use}</p>
      <div className="h-px w-8 gold-line mt-4 group-hover:w-full transition-all duration-700" />
    </div>
  );
}

export default function TechStack() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section id="tecnologia" className="relative py-24 px-6 paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">Tecnologias previstas</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            Hardware, software e IA
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto">
            Do microfone na sala de aula ao modelo de IA no servidor — cada peça tem um papel.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tech.map((t, i) => (
            <TechCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
