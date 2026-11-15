import { useEffect, useState, useCallback, useRef, type KeyboardEvent as EventoTecladoReact } from 'react';
import { api } from '../../api/cliente';
import { LessonResponse } from '../../api/tipos';
import { useRoteador } from '../../app/Roteador';
import AbaResumo from './AbaResumo';
import AbaFotos from './AbaFotos';
import VisualizadorSlides from '../slides/VisualizadorSlides';
import EmblemaPerdido from '../../components/EmblemaPerdido';
import EmblemaPreparando from '../../components/EmblemaPreparando';
import EmblemaIndisponivel from '../../components/EmblemaIndisponivel';
import { tomDaDisciplina } from '../../lib/tomDisciplina';
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
  RefreshCw,
} from 'lucide-react';
import './detalhe-aula.css';

interface DetalheAulaProps {
  id: string;
}

const ABAS = [
  { id: 'resumo', rotulo: 'Resumo', Icone: BookOpen },
  { id: 'slides', rotulo: 'Slides', Icone: Presentation },
  { id: 'fotos', rotulo: 'Fotos do quadro', Icone: ImageIcon },
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

/** Esqueleto com o mesmo desenho da aula pronta (capa, abas e conteúdo). */
function EsqueletoDetalhe() {
  return (
    <div className="av-pagina av-aula" role="status" aria-busy="true">
      <span className="sr-only">Carregando aula…</span>

      <div aria-hidden="true" className="av-aula-esq" style={{ height: '2.5rem', width: '11rem' }} />

      <div aria-hidden="true" className="av-aula-capa">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="av-aula-esq" style={{ height: '1.6rem', width: '7rem', borderRadius: '999px' }} />
          <div className="av-aula-esq" style={{ height: '1.6rem', width: '6rem', borderRadius: '999px' }} />
        </div>
        <div className="av-aula-esq" style={{ height: '2.6rem', width: '75%' }} />
        <div className="av-aula-esq" style={{ height: '3.2rem', width: '100%', borderRadius: '0.75rem' }} />
      </div>

      <div aria-hidden="true" style={{ display: 'flex', gap: '1rem' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="av-aula-esq" style={{ height: '2.2rem', width: '6.5rem' }} />
        ))}
      </div>

      <div aria-hidden="true" className="av-aula-esq" style={{ height: '16rem', borderRadius: '1.5rem' }} />
    </div>
  );
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
      setStatusHttp(200);
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
    return <EsqueletoDetalhe />;
  }

  // Erro de carregamento (404 não oferece "tentar novamente": a aula não existe)
  if (erro || !aula) {
    return (
      <div className="av-pagina av-aula">
        <div className="av-estado av-estado-erro anim-fade-up" role="alert">
          <EmblemaPerdido inView={true} className="av-emblema-mini" />
          <h2 className="av-estado-titulo">
            {statusHttp === 404 ? 'Aula não encontrada' : 'Aula indisponível'}
          </h2>
          <p className="av-estado-texto">
            A aula solicitada não pôde ser carregada ou não existe nesta demonstração.
          </p>
          <div className="av-aula-acoes">
            {statusHttp !== 404 && (
              <button onClick={() => buscarAula()} className="av-btn av-btn-primario av-btn-lg">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Tentar novamente</span>
              </button>
            )}
            <button onClick={() => navegar('/aulas')} className="av-btn av-btn-contorno av-btn-lg">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar à biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Comportamento para status PROCESSING
  if (aula.status === 'PROCESSING') {
    return (
      <div className="av-pagina av-aula">
        <div className="av-estado av-aula-estado-largo anim-fade-up" role="status">
          <div className="av-aula-emblema anim-float-soft">
            <EmblemaPreparando inView={true} />
          </div>
          <span className="av-pill av-pill-aviso">
            <span className="av-aula-ponto-vivo" aria-hidden="true" />
            Em processamento
          </span>
          <h2 className="av-estado-titulo" style={{ marginTop: '0.75rem' }}>
            Esta aula ainda está sendo preparada
          </h2>
          <p className="av-estado-texto">
            Nossos modelos de inteligência artificial estão transcrevendo a gravação e estruturando o
            resumo e os slides didáticos. Esta tela atualiza automaticamente.
          </p>
          <div className="av-aula-progresso" aria-hidden="true" />
          <p className="av-aula-nota">Verificando novidades a cada 3 segundos</p>
          <div className="av-aula-acoes">
            <button onClick={() => navegar('/aulas')} className="av-btn av-btn-contorno av-btn-lg">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar para a biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Comportamento para status CREATED ou FAILED (nunca mostra failureReason ao aluno)
  if (aula.status === 'CREATED' || aula.status === 'FAILED') {
    return (
      <div className="av-pagina av-aula">
        <div className="av-estado av-estado-vazio anim-fade-up">
          <EmblemaIndisponivel inView={true} className="av-emblema-mini" />
          <h2 className="av-estado-titulo">Esta aula ainda não está disponível</h2>
          <p className="av-estado-texto">
            O material desta aula ainda está aguardando finalização pelo professor ou passou por
            instabilidade.
          </p>
          <div className="av-aula-acoes">
            <button onClick={() => navegar('/aulas')} className="av-btn av-btn-primario av-btn-lg">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar à biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Aula DONE: renderização completa da página da aula
  return (
    <div className="av-pagina av-aula av-aula-entra" data-tom={tomDaDisciplina(aula.subject)}>
      {/* Voltar e transparência de IA */}
      <div className="av-aula-topo no-print">
        <button onClick={() => navegar('/aulas')} className="av-aula-voltar">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar à biblioteca</span>
        </button>

        <button
          onClick={() => alert('O diálogo "Como foi gerado" com os prompts e instruções da IA será ativado na Fase 7.')}
          className="av-btn av-btn-contorno av-aula-ajuda"
          title="Ver as instruções e prompts que geraram este conteúdo"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          <span>Como foi gerado</span>
        </button>
      </div>

      {/* Capa da aula (oculta só na impressão dos slides, que tem cabeçalho próprio) */}
      <header className={`av-aula-capa ${abaAtiva === 'slides' ? 'no-print' : ''}`}>
        <div className="av-aula-meta">
          <span className="av-aula-tag">{aula.subject}</span>
          <span className="av-aula-data">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={aula.createdAt}>{formatarData(aula.createdAt)}</time>
          </span>
          <span className="av-pill">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Gerado por IA
          </span>
        </div>

        <h1 className="av-aula-titulo">{aula.title}</h1>

        {/* Aviso fixo sobre IA (obrigatório por ética e transparência) */}
        <div className="av-aula-aviso">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <p>
            <strong>Aviso de IA:</strong> este conteúdo foi gerado por inteligência artificial a partir
            da gravação oral da aula e pode conter imprecisões. Confira sempre com as orientações do seu
            professor e seu caderno.
          </p>
        </div>
      </header>

      {/* Abas (WAI-ARIA: tablist, aria-selected, roving tabindex e setas) */}
      <div
        className="av-abas no-print"
        role="tablist"
        aria-label="Conteúdos da aula"
        onKeyDown={aoTeclarAba}
      >
        {ABAS.map((aba) => {
          const ativa = abaAtiva === aba.id;

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
              className="av-aba"
            >
              <aba.Icone className="w-4 h-4" aria-hidden="true" />
              <span>{aba.rotulo}</span>
              {aba.id === 'fotos' && (
                <span className="av-aba-qtd" aria-label={`${aula.images.length} fotos`}>
                  {aula.images.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba selecionada */}
      <section
        className="av-aula-painel"
        role="tabpanel"
        id={`painel-${abaAtiva}`}
        aria-labelledby={`aba-${abaAtiva}`}
        tabIndex={0}
      >
        <div key={abaAtiva} className="av-aula-painel-conteudo">
          {abaAtiva === 'resumo' && (
            <AbaResumo resumoBruto={aula.summary} tituloAula={aula.title} />
          )}

          {abaAtiva === 'slides' && (
            <VisualizadorSlides presentation={aula.presentation} disciplina={aula.subject} />
          )}

          {abaAtiva === 'fotos' && <AbaFotos imagens={aula.images} tituloAula={aula.title} />}

          {abaAtiva === 'video' && (
            <div className="av-estado av-estado-vazio">
              <div className="av-estado-icone">
                <Video className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="av-estado-titulo">Guia visual do Google NotebookLM</h3>
              <p className="av-estado-texto">
                O passo a passo para gerar o vídeo desta aula no NotebookLM estará disponível em breve.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
