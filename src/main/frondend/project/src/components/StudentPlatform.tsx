import { useState } from 'react';
import { Search, Volume2, FileText, ImageIcon, BookOpen, ChevronRight, Headphones } from 'lucide-react';
import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';

const classes = [
  {
    subject: 'Matemática',
    topic: 'Equação do 2º grau',
    teacher: 'Prof. Adriano',
    date: '08/11',
    class: 'Turma B · 9º ano',
    hasAudio: true,
    hasImages: true,
    hasSummary: true,
    excerpt: 'Resolução pelo método de Bhaskara. Condições do discriminante.',
  },
  {
    subject: 'História',
    topic: 'Renascimento italiano',
    teacher: 'Profa. Helena',
    date: '07/11',
    class: 'Turma A · 8º ano',
    hasAudio: true,
    hasImages: true,
    hasSummary: true,
    excerpt: 'Da Vinci, Michelangelo e o florescer das artes em Florença.',
  },
  {
    subject: 'Ciências',
    topic: 'Fotossíntese',
    teacher: 'Prof. Lobo',
    date: '06/11',
    class: 'Turma C · 7º ano',
    hasAudio: true,
    hasImages: false,
    hasSummary: true,
    excerpt: 'Como as plantas convertem luz em energia. Etapas do processo.',
  },
  {
    subject: 'Português',
    topic: 'Figuras de linguagem',
    teacher: 'Profa. Marina',
    date: '05/11',
    class: 'Turma B · 9º ano',
    hasAudio: true,
    hasImages: true,
    hasSummary: false,
    excerpt: 'Metáfora, metonímia e personificação em textos clássicos.',
  },
];

const filters = ['Todas', 'Matemática', 'História', 'Ciências', 'Português'];

function MaterialChip({ icon: Icon, label, active }: { icon: typeof Volume2; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${active ? 'bg-ink text-parchment' : 'bg-ink/5 text-ink-soft'}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

export default function StudentPlatform() {
  const [filter, setFilter] = useState('Todas');
  const [selected, setSelected] = useState(0);
  const { ref, inView } = useReveal(0.15);

  const filtered = filter === 'Todas' ? classes : classes.filter((c) => c.subject === filter);
  const current = filtered[Math.min(selected, filtered.length - 1)] ?? classes[0];

  return (
    <section id="plataforma" className="relative py-24 px-6 bg-parchment paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold">A plataforma</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            O aluno estuda no seu ritmo
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto">
            Localize uma aula por turma, disciplina, professor ou data. Acesse gravação,
            transcrição, imagens e resumo — e prepare-se para provas com exercícios gerados pela IA.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="art-frame rounded-2xl overflow-hidden shadow-xl">
          {/* browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-ink/5 border-b border-gold/15">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terra/60" />
              <div className="w-3 h-3 rounded-full bg-gold/60" />
              <div className="w-3 h-3 rounded-full bg-sage/60" />
            </div>
            <div className="flex-1 mx-4 px-3 py-1 rounded-full bg-parchment text-xs text-ink-soft flex items-center gap-2">
              <Search className="w-3 h-3" />
              aulaviva.com/minhas-aulas
            </div>
          </div>

          <div className="grid md:grid-cols-[300px_1fr] min-h-[480px]">
            {/* sidebar — class list */}
            <div className="border-r border-gold/15 bg-parchment/50 p-4 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setSelected(0); }}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${filter === f ? 'bg-ink text-parchment' : 'bg-ink/5 text-ink-soft hover:bg-ink/10'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-2 overflow-y-auto flex-1">
                {filtered.map((c, i) => (
                  <button
                    key={c.topic}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${selected === i ? 'bg-gold/15 border border-gold/40' : 'hover:bg-ink/5 border border-transparent'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-widest2 uppercase text-terra-deep font-semibold">{c.subject}</span>
                      <span className="text-[10px] text-ink-soft">{c.date}</span>
                    </div>
                    <p className="text-sm font-medium text-ink mt-1">{c.topic}</p>
                    <p className="text-[11px] text-ink-soft">{c.class}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* main panel — selected class */}
            <div className="p-6 flex flex-col" key={current.topic}>
              <div className="slide-fade">
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="tracking-widest2 uppercase text-terra-deep font-semibold">{current.subject}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{current.class}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{current.date}</span>
                </div>
                <h3 className="font-display text-3xl font-semibold text-ink mt-2">{current.topic}</h3>
                <p className="text-sm text-ink-soft mt-1">{current.teacher}</p>

                {/* material chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <MaterialChip icon={Headphones} label="Áudio" active={current.hasAudio} />
                  <MaterialChip icon={ImageIcon} label="Imagens" active={current.hasImages} />
                  <MaterialChip icon={FileText} label="Transcrição" active={current.hasAudio} />
                  <MaterialChip icon={BookOpen} label="Resumo" active={current.hasSummary} />
                </div>

                {/* transcript preview */}
                <div className="mt-6 art-frame rounded-xl p-5 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-end gap-0.5 h-4">
                      {[0.4, 0.7, 1, 0.6, 0.8, 0.5].map((h, i) => (
                        <div key={i} className="w-1 bg-terra rounded-full wave-bar" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-ink-soft">Trecho da transcrição</span>
                  </div>
                  <p className="font-display text-lg text-ink leading-relaxed">
                    {current.excerpt}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button className="ink-btn px-5 py-2 rounded-full text-xs flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5" /> Ouvir aula
                    </button>
                    <button className="px-5 py-2 rounded-full border border-ink/20 text-xs text-ink hover:bg-ink/5 transition-all duration-300 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Ver resumo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* art reference note */}
        <div className="flex items-center justify-center gap-4 mt-8 text-ink-soft">
          <div className="w-16 h-16 opacity-60">
            <ArtFigure pose="scholar" inView={inView} className="w-full h-full" />
          </div>
          <p className="text-sm italic max-w-md text-center">
            "Para recuperar uma aula perdida, o estudante consulta o registro e estuda no próprio ritmo."
          </p>
        </div>
      </div>
    </section>
  );
}
