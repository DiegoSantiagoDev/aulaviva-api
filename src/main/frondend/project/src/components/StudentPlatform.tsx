import { useState } from 'react';
import { Search, ImageIcon, BookOpen, ChevronRight, Presentation, Video, LucideIcon } from 'lucide-react';
import ArtFigure from './ArtFigure.tsx';
import { useReveal } from '../hooks/useReveal.ts';
import { useRoteador } from '../app/Roteador.tsx';

const classes = [
  {
    subject: 'Matemática',
    topic: 'Função do 1º grau',
    teacher: 'Prof. Adriano Lobo',
    date: '08/11',
    class: 'Turma B · 9º ano',
    hasSlides: true,
    hasImages: true,
    hasSummary: true,
    excerpt: 'Compreensão intuitiva de coeficientes lineares e angulares, raiz da função e gráficos no cotidiano.',
  },
  {
    subject: 'História',
    topic: 'Renascimento italiano',
    teacher: 'Profa. Helena',
    date: '07/11',
    class: 'Turma A · 8º ano',
    hasSlides: true,
    hasImages: true,
    hasSummary: true,
    excerpt: 'Da Vinci, Michelangelo e o florescer das artes, da razão e do humanismo em Florença.',
  },
  {
    subject: 'Ciências',
    topic: 'Fotossíntese e Energia',
    teacher: 'Prof. Lobo',
    date: '06/11',
    class: 'Turma C · 7º ano',
    hasSlides: false,
    hasImages: true,
    hasSummary: true,
    excerpt: 'Como as plantas convertem luz em energia química através de tilacoides e ciclo de Calvin.',
  },
  {
    subject: 'Português',
    topic: 'Figuras de linguagem',
    teacher: 'Profa. Marina',
    date: '05/11',
    class: 'Turma B · 9º ano',
    hasSlides: true,
    hasImages: false,
    hasSummary: true,
    excerpt: 'Metáfora, metonímia e personificação analisadas em textos poéticos e literários.',
  },
];

const filters = ['Todas', 'Matemática', 'História', 'Ciências', 'Português'];

function MaterialChip({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        active
          ? 'bg-ink text-parchment shadow-sm'
          : 'bg-ink/5 text-ink-soft opacity-60'
      }`}
    >
      <Icon className="w-3.5 h-3.5 text-gold" />
      <span>{label}</span>
    </div>
  );
}

export default function StudentPlatform() {
  const [filter, setFilter] = useState('Todas');
  const [selected, setSelected] = useState(0);
  const { ref, inView } = useReveal(0.15);
  const { navegar } = useRoteador();

  const filtered = filter === 'Todas' ? classes : classes.filter((c) => c.subject === filter);
  const current = filtered[Math.min(selected, filtered.length - 1)] ?? classes[0];

  return (
    <section id="plataforma" className="relative py-24 px-6 bg-parchment paper-grain">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-gold font-semibold">A plataforma do aluno</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            O aluno estuda no seu ritmo
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto text-base leading-relaxed">
            Localize a aula por matéria ou data. Acesse resumos didáticos estruturados,
            apresentações de slides dinâmicas, fotos do quadro e guias visuais para gerar vídeo no Google NotebookLM.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="art-frame rounded-2xl overflow-hidden shadow-2xl border border-gold/30">
          {/* Barra do navegador simulado */}
          <div className="flex items-center gap-2 px-4 py-3 bg-ink/5 border-b border-gold/15">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terra/60" />
              <div className="w-3 h-3 rounded-full bg-gold/60" />
              <div className="w-3 h-3 rounded-full bg-sage/60" />
            </div>
            <div className="flex-1 mx-4 px-3 py-1 rounded-full bg-parchment text-xs text-ink-soft flex items-center gap-2 shadow-inner">
              <Search className="w-3 h-3 text-gold" />
              <span>aulaviva.com/#/aulas</span>
            </div>
            <button
              onClick={() => navegar('/aulas')}
              className="text-xs font-semibold text-terra hover:underline"
            >
              Abrir App
            </button>
          </div>

          <div className="grid md:grid-cols-[300px_1fr] min-h-[480px]">
            {/* Barra lateral com lista de aulas */}
            <div className="border-r border-gold/15 bg-parchment/50 p-4 flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setSelected(0); }}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-300 font-medium ${
                      filter === f
                        ? 'bg-ink text-parchment shadow-sm'
                        : 'bg-ink/5 text-ink-soft hover:bg-gold/15'
                    }`}
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
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 ${
                      selected === i
                        ? 'bg-gold/20 border border-gold/50 shadow-sm'
                        : 'hover:bg-ink/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-widest2 uppercase text-terra font-semibold">{c.subject}</span>
                      <span className="text-[10px] text-ink-soft">{c.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink mt-1">{c.topic}</p>
                    <p className="text-[11px] text-ink-soft">{c.class}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Painel principal com a aula selecionada */}
            <div className="p-6 sm:p-8 flex flex-col justify-between" key={current.topic}>
              <div className="slide-fade">
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="tracking-widest2 uppercase text-terra font-semibold">{current.subject}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                  <span>{current.class}</span>
                  <ChevronRight className="w-3 h-3 text-gold" />
                  <span>{current.date}</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2">{current.topic}</h3>
                <p className="text-sm text-ink-soft mt-1">{current.teacher}</p>

                {/* Chips de recursos disponíveis */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <MaterialChip icon={BookOpen} label="Resumo Didático" active={current.hasSummary} />
                  <MaterialChip icon={Presentation} label="Slides Dinâmicos" active={current.hasSlides} />
                  <MaterialChip icon={ImageIcon} label="Fotos do Quadro" active={current.hasImages} />
                  <MaterialChip icon={Video} label="Guia NotebookLM" active={true} />
                </div>

                {/* Prévia do conteúdo pedagógico */}
                <div className="mt-6 art-frame rounded-xl p-6 border border-gold/25 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-gold anim-breathe" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-ink-soft">Síntese Estruturada</span>
                  </div>
                  <p className="font-display text-lg text-ink leading-relaxed">
                    "{current.excerpt}"
                  </p>
                  <p className="text-xs text-ink-soft/80 mt-3">
                    Gerado automaticamente a partir da exposição oral do professor e anotações do quadro.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navegar('/aulas')}
                      className="ink-btn px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      <Presentation className="w-3.5 h-3.5 text-gold" />
                      <span>Ver Resumo e Slides</span>
                    </button>
                    <button
                      onClick={() => navegar('/aulas')}
                      className="gold-outline-btn px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5 text-terra" />
                      <span>Gerar Vídeo no NotebookLM</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mascote de leitura */}
        <div className="flex items-center justify-center gap-4 mt-8 text-ink-soft">
          <div className="w-16 h-16 opacity-70">
            <ArtFigure pose="scholar" inView={inView} className="w-full h-full" />
          </div>
          <p className="text-sm italic max-w-md text-center">
            "Para recuperar uma aula perdida, o estudante revisa o resumo, estuda pelos slides e aprofunda no próprio ritmo."
          </p>
        </div>
      </div>
    </section>
  );
}
