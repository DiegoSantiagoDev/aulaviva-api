import { useEffect, useState, useCallback, useRef, type KeyboardEvent as EventoTecladoReact } from 'react';
import { api } from '../../api/cliente';
import { LessonResponse } from '../../api/tipos';
import { useRoteador } from '../../app/Roteador';
import AbaResumo from './AbaResumo';
import AbaFotos from './AbaFotos';
import VisualizadorSlides from '../slides/VisualizadorSlides';
import ArtFigure from '../../components/ArtFigure';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Presentation,
  ImageIcon,
  Video,
  AlertCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';

interface DetalheAulaProps {
  id: string;
}

const ABAS = [
  { id: 'resumo', rotulo: 'Resumo', Icone: BookOpen },
  { id: 'slides', rotulo: 'Slides', Icone: Presentation },
  { id: 'fotos', rotulo: 'Fotos do Quadro', Icone: ImageIcon },
  { id: 'video', rotulo: 'Vídeo (NotebookLM)', Icone: Video },
] as const;

type TipoAba = (typeof ABAS)[number]['id'];

function ehAbaValida(valor: string | null): valor is TipoAba {
  return ABAS.some((aba) => aba.id === valor);
}

function formatarData(dataIso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeZone: 'America/Fortaleza',
    }).format(new Date(dataIso));
  } catch {
    return 'Data recente';
  }
}

export default function DetalheAula({ id }: DetalheAulaProps) {
  const { navegar, searchParams } = useRoteador();
  const [aula, setAula] = useState<LessonResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusHttp, setStatusHttp] = useState<number>(200);

  // Aba ativa sincronizada com query param ?aba= (valor inválido cai em resumo)
  const abaParam = searchParams.get('aba');
  const abaAtiva: TipoAba = ehAbaValida(abaParam) ? abaParam : 'resumo';

  const abaRefs = useRef<Partial<Record<TipoAba, HTMLButtonElement | null>>>({});

  const mudarAba = (novaAba: TipoAba) => {
    navegar(`/aulas/${id}?aba=${novaAba}`);
  };

  const indiceAbaAtiva = ABAS.findIndex((aba) => aba.id === abaAtiva);

  const aoTeclarAba = (e: EventoTecladoReact<HTMLDivElement>) => {
    let novoIndice = indiceAbaAtiva;

    if (e.key === 'ArrowRight') {
      novoIndice = (indiceAbaAtiva + 1) % ABAS.length;
    } else if (e.key === 'ArrowLeft') {
      novoIndice = (indiceAbaAtiva - 1 + ABAS.length) % ABAS.length;
    } else if (e.key === 'Home') {
      novoIndice = 0;
    } else if (e.key === 'End') {
      novoIndice = ABAS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const destino = ABAS[novoIndice];
    mudarAba(destino.id);
    abaRefs.current[destino.id]?.focus();
  };

  const buscarAula = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCarregando(true);
      setErro(null);
      try {
        const dados = await api.obterAula(Number(id));
        setAula(dados);
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'status' in e) {
          const status = Number((e as { status: number }).status);
          setStatusHttp(status);
        }
        setErro('Aula não encontrada ou temporariamente indisponível.');
      } finally {
        setCarregando(false);
      }
    },
    [id]
  );

  useEffect(() => {
    buscarAula();
  }, [buscarAula]);

  // Polling a cada 3 segundos caso a aula esteja em PROCESSING
  useEffect(() => {
    if (aula && aula.status === 'PROCESSING') {
      const timer = setInterval(() => {
        buscarAula(true);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [aula, buscarAula]);

  if (carregando) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-6 w-32 bg-gold/20 rounded" />
        <div className="h-12 w-3/4 bg-ink/15 rounded" />
        <div className="h-64 bg-gold/10 rounded-3xl" />
      </div>
    );
  }

  if (erro || !aula) {
    return (
      <div className="art-frame rounded-2xl p-12 text-center border border-terra/30 bg-terra/5 max-w-lg mx-auto py-16 anim-fade-up">
        <div className="w-24 h-24 mx-auto mb-4">
          <ArtFigure pose="david" inView={true} className="w-full h-full text-terra" />
        </div>
        <h2 className="font-display text-3xl font-bold text-ink">
          {statusHttp === 404 ? 'Aula não encontrada' : 'Aula indisponível'}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          A aula solicitada não pôde ser carregada ou não existe nesta demonstração.
        </p>
        <button
          onClick={() => navegar('/aulas')}
          className="ink-btn mt-6 px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à biblioteca</span>
        </button>
      </div>
    );
  }

  // Comportamento para status PROCESSING
  if (aula.status === 'PROCESSING') {
    return (
      <div className="art-frame rounded-3xl p-12 text-center border border-gold/30 max-w-xl mx-auto py-16 anim-fade-up space-y-6">
        <div className="w-32 h-32 mx-auto">
          <ArtFigure pose="david" inView={true} className="w-full h-full text-gold anim-float-soft" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Processamento em Andamento</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2">
            Esta aula ainda está sendo preparada
          </h2>
          <p className="mt-3 text-ink-soft text-sm leading-relaxed">
            Nossos modelos de inteligência artificial estão transcrevendo a gravação e estruturando o resumo e os slides didáticos. Esta tela atualiza automaticamente.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-terra font-medium">
          <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
          <span>Consultando novidades a cada 3 segundos...</span>
        </div>
        <div>
          <button
            onClick={() => navegar('/aulas')}
            className="gold-outline-btn px-5 py-2 rounded-full text-xs font-semibold"
          >
            Voltar para a biblioteca
          </button>
        </div>
      </div>
    );
  }

  // Comportamento para status CREATED ou FAILED (nunca mostra failureReason ao aluno)
  if (aula.status === 'CREATED' || aula.status === 'FAILED') {
    return (
      <div className="art-frame rounded-2xl p-12 text-center border border-gold/30 max-w-lg mx-auto py-16 anim-fade-up">
        <div className="w-20 h-20 mx-auto mb-4 opacity-50">
          <ArtFigure pose="scholar" inView={true} className="w-full h-full text-ink" />
        </div>
        <h2 className="font-display text-3xl font-bold text-ink">
          Esta aula ainda não está disponível
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          O material desta aula ainda está aguardando finalização pelo professor ou passou por instabilidade.
        </p>
        <button
          onClick={() => navegar('/aulas')}
          className="ink-btn mt-6 px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à biblioteca</span>
        </button>
      </div>
    );
  }

  // Aula DONE: Renderização completa da página da aula
  return (
    <div className="space-y-8 anim-fade-up">
      {/* Botão voltar e navegação de topo */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navegar('/aulas')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-terra py-2 px-3 rounded-lg hover:bg-gold/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à biblioteca</span>
        </button>

        <button
          onClick={() => alert('O diálogo "Como foi gerado" com os prompts e instruções da IA será ativado na Fase 7.')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gold/30 hover:bg-gold/15 text-ink transition-colors"
          title="Ver as instruções e prompts que geraram este conteúdo"
        >
          <HelpCircle className="w-3.5 h-3.5 text-gold" />
          <span>Como foi gerado</span>
        </button>
      </div>

      {/* Cabeçalho da Aula */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold px-3 py-1 rounded-full bg-gold/15 text-terra-deep uppercase text-xs tracking-wider">
            {aula.subject}
          </span>
          <span className="text-xs text-ink-soft flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold" />
            <time dateTime={aula.createdAt}>{formatarData(aula.createdAt)}</time>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-ink/5 text-ink-soft border border-gold/20">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Gerado por IA</span>
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
          {aula.title}
        </h1>

        {/* Aviso Fixo sobre IA (Obrigatório por ética e transparência) */}
        <div className="bg-gold/10 border-l-4 border-gold p-3.5 rounded-r-xl text-xs text-ink-soft flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-terra flex-shrink-0 mt-0.5" />
          <span>
            <strong>Aviso de IA:</strong> Este conteúdo foi gerado por inteligência artificial a partir da gravação oral da aula e pode conter imprecisões. Confira sempre com as orientações do seu professor e seu caderno.
          </span>
        </div>
      </header>

      {/* Barra de Abas (WAI-ARIA: tablist, aria-selected, roving tabindex e setas) */}
      <div
        className="border-b border-gold/25 no-print"
        role="tablist"
        aria-label="Conteúdos da aula"
        onKeyDown={aoTeclarAba}
      >
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-px">
          {ABAS.map((aba) => {
            const ativa = abaAtiva === aba.id;
            const rotulo =
              aba.id === 'fotos' ? `Fotos do Quadro (${aula.images.length})` : aba.rotulo;

            return (
              <button
                key={aba.id}
                ref={(el) => {
                  abaRefs.current[aba.id] = el;
                }}
                id={`aba-${aba.id}`}
                type="button"
                role="tab"
                aria-selected={ativa}
                aria-controls={`painel-${aba.id}`}
                tabIndex={ativa ? 0 : -1}
                onClick={() => mudarAba(aba.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-display text-base sm:text-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  ativa
                    ? 'border-gold text-ink bg-gold/10 rounded-t-xl'
                    : 'border-transparent text-ink-soft hover:text-ink hover:border-gold/30'
                }`}
              >
                <aba.Icone className="w-4 h-4 text-gold" aria-hidden="true" />
                <span>{rotulo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <section
        className="min-h-[400px] focus-visible:outline-none"
        role="tabpanel"
        id={`painel-${abaAtiva}`}
        aria-labelledby={`aba-${abaAtiva}`}
        tabIndex={0}
      >
        {abaAtiva === 'resumo' && (
          <AbaResumo resumoBruto={aula.summary} tituloAula={aula.title} />
        )}

        {abaAtiva === 'slides' && (
          <VisualizadorSlides
            presentation={aula.presentation}
            disciplina={aula.subject}
          />
        )}

        {abaAtiva === 'fotos' && (
          <AbaFotos imagens={aula.images} tituloAula={aula.title} />
        )}

        {abaAtiva === 'video' && (
          <div className="art-frame rounded-3xl p-10 text-center border border-gold/30 space-y-4">
            <Video className="w-12 h-12 text-terra mx-auto" />
            <h3 className="font-display text-3xl font-bold text-ink">Guia Visual do Google NotebookLM</h3>
            <p className="text-sm text-ink-soft max-w-md mx-auto">
              O passo a passo com marcações em SVG e cópia de prompt será ativado na Fase 6.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
