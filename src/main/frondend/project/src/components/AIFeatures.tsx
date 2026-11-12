import { useState, useEffect, useRef } from 'react';
import { Languages, ScanText, Presentation, LucideIcon } from 'lucide-react';
import { useReveal } from '../hooks/useReveal.ts';

interface TabItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  demo: 'transcription' | 'analysis' | 'materials';
}

const tabs: TabItem[] = [
  {
    icon: Languages,
    title: 'Transcrição acústica (Whisper)',
    desc: 'O modelo Whisper Large V3 transcreve a fala da aula no servidor. Trata-se de uma etapa técnica interna: o aluno recebe o conteúdo filtrado e estruturado, nunca a transcrição bruta cheia de ruídos.',
    demo: 'transcription',
  },
  {
    icon: ScanText,
    title: 'Síntese didática estruturada (Qwen)',
    desc: 'Em uma única chamada ao modelo Qwen 3.8 27B (via Groq), a IA analisa o áudio e as fotos do quadro, organizando tópicos principais, conceitos fundamentais e perguntas de fixação.',
    demo: 'analysis',
  },
  {
    icon: Presentation,
    title: 'Slides e Guia do NotebookLM',
    desc: 'A IA gera simultaneamente os slides da aula em layouts visuais CSS adaptativos e o roteiro contextualizado para criação de vídeo explicativo no Google NotebookLM.',
    demo: 'materials',
  },
];

const transcriptionText =
  '...e assim vemos que a equação do segundo grau pode ser resolvida pelo método de Bhaskara, onde o delta determina o número de raízes reais...';

const analysisItems = [
  { tag: 'Conceito', text: 'Função do 1º grau (Afim)' },
  { tag: 'Fórmula', text: 'f(x) = ax + b' },
  { tag: 'Propriedade', text: 'a > 0 (crescente) | a < 0 (decrescente)' },
  { tag: 'Quadro', text: 'Gráfico e tabela associados' },
];

const materialsList = [
  { type: 'Resumo', text: 'Resumo didático estruturado em seções' },
  { type: 'Slides', text: 'Apresentação com 8 layouts visuais em CSS' },
  { type: 'Vídeo', text: 'Prompt e guia passo a passo para o NotebookLM' },
  { type: 'Quadro', text: 'Galeria com fotos do quadro e zoom acessível' },
];

function Demo({ type }: { type: string }) {
  if (type === 'transcription') return <TranscriptionDemo />;
  if (type === 'analysis') return <AnalysisDemo />;
  return <MaterialsDemo />;
}

function TranscriptionDemo() {
  const [typed, setTyped] = useState('');
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setTyped(transcriptionText.slice(0, i));
      if (i >= transcriptionText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="art-frame rounded-xl p-6 border border-gold/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-end gap-0.5 h-5">
          {[0.5, 0.8, 1, 0.6, 0.9, 0.4].map((h, i) => (
            <div key={i} className="w-1 bg-terra rounded-full wave-bar" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <span className="text-xs text-ink-soft tracking-wide font-medium">Processamento de fala no servidor...</span>
      </div>
      <p ref={ref} className="font-display text-lg leading-relaxed text-ink min-h-[6rem] type-cursor">
        {typed}
      </p>
      <div className="mt-3 pt-3 border-t border-gold/20 text-[11px] text-ink-soft/70">
        Etapa interna do pipeline &middot; O aluno recebe apenas o resumo didático limpo.
      </div>
    </div>
  );
}

function AnalysisDemo() {
  const { ref, inView } = useReveal(0.2);
  return (
    <div ref={ref as never} className="art-frame rounded-xl p-6 space-y-3 border border-gold/30">
      {analysisItems.map((item, i) => (
        <div
          key={item.text}
          className={`flex items-center gap-3 slide-fade ${inView ? '' : 'opacity-0'}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <span className="px-2 py-0.5 rounded text-[10px] tracking-widest2 uppercase bg-gold/20 text-terra-deep font-semibold">
            {item.tag}
          </span>
          <span className="text-ink text-sm font-medium">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function MaterialsDemo() {
  return (
    <div className="art-frame rounded-xl p-6 space-y-2.5 border border-gold/30">
      {materialsList.map((m, i) => (
        <div
          key={m.text}
          className="flex items-center gap-3 p-3 rounded-lg bg-parchment/60 hover:bg-gold/15 transition-colors duration-300 slide-fade"
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          <span className="px-2.5 py-1 rounded text-[10px] tracking-wide uppercase bg-ink text-parchment font-semibold whitespace-nowrap shadow-sm">
            {m.type}
          </span>
          <span className="text-ink text-sm font-medium">{m.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function AIFeatures() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useReveal(0.15);

  return (
    <section id="ia" className="relative py-24 px-6 paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold font-semibold">Inteligência artificial</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            O que a IA faz por cada aula
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto text-base">
            O pipeline automatizado transforma a gravação bruta e as fotos do quadro em materiais pedagógicos estruturados.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* abas interativas */}
          <div className="space-y-4">
            {tabs.map((t, i) => (
              <button
                key={t.title}
                onClick={() => setActive(i)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  active === i
                    ? 'border-gold bg-gold/10 shadow-lg'
                    : 'border-ink/10 bg-parchment/50 hover:border-gold/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${active === i ? 'bg-ink text-parchment shadow-md' : 'bg-ink/5 text-ink-soft'}`}>
                    <t.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold text-ink">{t.title}</h3>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${active === i ? 'border-gold bg-gold' : 'border-ink/20'}`}>
                    {active === i && <div className="w-2 h-2 rounded-full bg-ink m-auto mt-[5px]" />}
                  </div>
                </div>
                <p className={`text-ink-soft mt-3 text-sm leading-relaxed transition-all duration-300 ${active === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>

          {/* painel de demonstração */}
          <div className="sticky top-24">
            <div key={active} className="slide-fade">
              <Demo type={tabs[active].demo} />
            </div>
            <p className="mt-4 text-xs text-ink-soft italic text-center">
              Materiais gerados por IA são recursos de apoio e podem conter erros.
              Sempre confira com as anotações do seu caderno.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
