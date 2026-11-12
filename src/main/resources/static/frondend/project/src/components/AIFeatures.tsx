import { useState, useEffect, useRef } from 'react';
import { Languages, ScanText, FileQuestion } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const tabs = [
  {
    icon: Languages,
    title: 'Transcrição do áudio',
    desc: 'O reconhecimento de fala converte a gravação em texto. Consulte o que foi explicado sem precisar ouvir tudo de novo — considerando ruídos, falas simultâneas e termos técnicos.',
    demo: 'transcription',
  },
  {
    icon: ScanText,
    title: 'Análise e organização',
    desc: 'A IA identifica os assuntos abordados, organiza os principais conceitos e relaciona trechos da explicação aos registros visuais, preservando o contexto da aula.',
    demo: 'analysis',
  },
  {
    icon: FileQuestion,
    title: 'Geração de materiais',
    desc: 'A partir do conteúdo processado, o sistema produz resumos, explicações simplificadas, listas de conceitos, questões objetivas e discursivas, exercícios e simulados.',
    demo: 'materials',
  },
];

const transcriptionText =
  '...e assim vemos que a equação do segundo grau pode ser resolvida pelo método de Bhaskara, onde o delta determina o número de raízes reais...';

const analysisItems = [
  { tag: 'Conceito', text: 'Equação do 2º grau' },
  { tag: 'Fórmula', text: 'Δ = b² - 4ac' },
  { tag: 'Condição', text: 'Δ > 0 → duas raízes reais' },
  { tag: 'Visual', text: 'Gráfico: parábola (imagem anexada)' },
];

const materialsList = [
  { type: 'Resumo', text: 'Resumo da aula sobre equações do 2º grau' },
  { type: 'Questão objetiva', text: 'Calcule as raízes de x² - 5x + 6 = 0' },
  { type: 'Questão discursiva', text: 'Explique o significado do discriminante.' },
  { type: 'Exercício', text: 'Resolva os 5 exercícios propostos.' },
  { type: 'Simulado', text: 'Simulado de matemática — 10 questões' },
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
    <div className="art-frame rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-end gap-0.5 h-5">
          {[0.5, 0.8, 1, 0.6, 0.9, 0.4].map((h, i) => (
            <div key={i} className="w-1 bg-terra rounded-full wave-bar" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <span className="text-xs text-ink-soft tracking-wide">Áudio sendo transcrito...</span>
      </div>
      <p ref={ref} className="font-display text-lg leading-relaxed text-ink min-h-[6rem] type-cursor">
        {typed}
      </p>
    </div>
  );
}

function AnalysisDemo() {
  const { ref, inView } = useReveal(0.2);
  return (
    <div ref={ref as never} className="art-frame rounded-xl p-6 space-y-3">
      {analysisItems.map((item, i) => (
        <div
          key={item.text}
          className={`flex items-center gap-3 slide-fade ${inView ? '' : 'opacity-0'}`}
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          <span className="px-2 py-0.5 rounded text-[10px] tracking-widest2 uppercase bg-gold/15 text-terra-deep font-semibold">
            {item.tag}
          </span>
          <span className="text-ink-soft">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function MaterialsDemo() {
  return (
    <div className="art-frame rounded-xl p-6 space-y-2">
      {materialsList.map((m, i) => (
        <div
          key={m.text}
          className="flex items-center gap-3 p-3 rounded-lg bg-parchment/50 hover:bg-gold/10 transition-colors duration-300 cursor-pointer slide-fade"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <span className="px-2 py-1 rounded text-[10px] tracking-wide uppercase bg-ink text-parchment font-semibold whitespace-nowrap">
            {m.type}
          </span>
          <span className="text-ink-soft text-sm">{m.text}</span>
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
          <span className="text-xs tracking-widest2 uppercase text-gold">Inteligência artificial</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            O que a IA faz por cada aula
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto">
            Três etapas de processamento transformam registros brutos em materiais de apoio.
            Tudo com revisão do professor antes de chegar ao aluno.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* tabs */}
          <div className="space-y-4">
            {tabs.map((t, i) => (
              <button
                key={t.title}
                onClick={() => setActive(i)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-400 ${
                  active === i
                    ? 'border-gold bg-gold/10 shadow-lg'
                    : 'border-ink/10 bg-parchment/50 hover:border-gold/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-400 ${active === i ? 'bg-ink text-parchment' : 'bg-ink/5 text-ink-soft'}`}>
                    <t.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold text-ink">{t.title}</h3>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-400 ${active === i ? 'border-gold bg-gold' : 'border-ink/20'}`}>
                    {active === i && <div className="w-2 h-2 rounded-full bg-ink m-auto mt-[5px]" />}
                  </div>
                </div>
                <p className={`text-ink-soft mt-3 text-sm leading-relaxed transition-all duration-400 ${active === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>

          {/* demo panel */}
          <div className="sticky top-24">
            <div key={active} className="slide-fade">
              <Demo type={tabs[active].demo} />
            </div>
            <p className="mt-4 text-xs text-ink-soft italic text-center">
              Materiais gerados por IA são recursos de apoio e podem conter erros.
              Revisão do professor é sempre necessária.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
