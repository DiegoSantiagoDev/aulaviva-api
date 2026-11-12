import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../../api/cliente';
import { LessonListItem } from '../../api/tipos';
import CartaoAula from './CartaoAula';
import FiltroDisciplinas from './FiltroDisciplinas';
import EsqueletoAulas from './EsqueletoAulas';
import ArtFigure from '../../components/ArtFigure';
import { Search, X, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function BibliotecaAulas() {
  const [aulas, setAulas] = useState<LessonListItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [termoDebounced, setTermoDebounced] = useState('');
  const [disciplinaAtiva, setDisciplinaAtiva] = useState('Todas');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  // Debounce de 200ms na digitação da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoDebounced(termoBusca);
    }, 200);
    return () => clearTimeout(handler);
  }, [termoBusca]);

  const carregarAulas = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    setErro(null);
    try {
      const lista = await api.listarAulas();
      // Regra 1: Somente aulas com status DONE
      // Regra 2: Esconder aulas com hidden verdadeiro
      const aulasValidas = lista.filter(
        (a) => a.status === 'DONE' && a.hidden !== true
      );
      setAulas(aulasValidas);
      setUltimaAtualizacao(new Date());
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e
        ? String((e as { message: string }).message)
        : 'Não foi possível carregar as aulas. Verifique a conexão com o servidor.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarAulas();

    // Recarregar a cada 30 segundos com a aba visível
    const intervalo = setInterval(() => {
      if (document.visibilityState === 'visible') {
        carregarAulas(true);
      }
    }, 30000);

    // Recarregar imediatamente ao retornar à aba
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'visible') {
        carregarAulas(true);
      }
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
  }, [carregarAulas]);

  // Lista de disciplinas com contagem
  const disciplinasComContagem = useMemo(() => {
    const mapa = new Map<string, number>();
    aulas.forEach((a) => {
      const count = mapa.get(a.subject) || 0;
      mapa.set(a.subject, count + 1);
    });

    const lista = Array.from(mapa.entries()).map(([nome, contagem]) => ({
      nome,
      contagem,
    }));

    // Ordenação alfabética sem acento
    lista.sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    );

    return lista;
  }, [aulas]);

  // Filtragem e busca normalizada
  const aulasFiltradas = useMemo(() => {
    const buscaNorm = normalizar(termoDebounced);

    return aulas.filter((aula) => {
      // Filtro por disciplina selecionada
      if (disciplinaAtiva !== 'Todas' && aula.subject !== disciplinaAtiva) {
        return false;
      }

      // Filtro por termo de busca (título ou disciplina)
      if (buscaNorm) {
        const tituloNorm = normalizar(aula.title);
        const materiaNorm = normalizar(aula.subject);
        return tituloNorm.includes(buscaNorm) || materiaNorm.includes(buscaNorm);
      }

      return true;
    });
  }, [aulas, termoDebounced, disciplinaAtiva]);

  // Agrupamento por disciplina e ordenação por data decrescente dentro do grupo
  const gruposDisciplinas = useMemo(() => {
    const mapa = new Map<string, LessonListItem[]>();

    aulasFiltradas.forEach((aula) => {
      const grupo = mapa.get(aula.subject) || [];
      grupo.push(aula);
      mapa.set(aula.subject, grupo);
    });

    // Ordena as disciplinas alfabeticamente
    const chaves = Array.from(mapa.keys()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );

    return chaves.map((materia) => {
      const listaAulas = mapa.get(materia) || [];
      // Ordena por data decrescente
      listaAulas.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { materia, aulas: listaAulas };
    });
  }, [aulasFiltradas]);

  return (
    <div className="space-y-10 anim-fade-up">
      {/* Topo com mascote em pose de boas-vindas */}
      <section className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl art-frame border border-gold/30">
        <div className="w-24 h-24 flex-shrink-0">
          <ArtFigure pose="vitruvian" inView={true} className="w-full h-full text-ink" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-xs uppercase tracking-widest2 text-gold font-semibold">
            Espaço de Aprendizagem
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink mt-1">
            Biblioteca de Aulas
          </h1>
          <p className="mt-2 text-ink-soft text-sm sm:text-base max-w-2xl leading-relaxed">
            Todas as aulas com processamento concluído estão reunidas aqui.
            Estude através de resumos pedagógicos, apresentações de slides dinâmicas e vídeos gerados no NotebookLM.
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end text-xs text-ink-soft/70">
          <button
            onClick={() => carregarAulas(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 text-ink-soft hover:text-ink transition-colors font-medium"
            title="Atualizar lista agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-gold' : ''}`} />
            <span>Atualizar</span>
          </button>
          <span className="mt-1 text-[11px]">
            Atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </section>

      {/* Controles: Busca e Filtros de Disciplina */}
      <section className="space-y-5">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-gold absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por título ou matéria (ex: Bhaskara, História)..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-parchment/80 border border-gold/30 text-ink placeholder:text-ink-soft/50 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-inner"
            aria-label="Buscar aulas"
          />
          {termoBusca && (
            <button
              onClick={() => setTermoBusca('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-terra p-1"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Chips de filtro por disciplina */}
        <FiltroDisciplinas
          disciplinas={disciplinasComContagem}
          selecionada={disciplinaAtiva}
          onSelecionar={setDisciplinaAtiva}
          totalAulas={aulas.length}
        />
      </section>

      {/* Estados visuais da listagem */}
      {carregando && <EsqueletoAulas />}

      {erro && !carregando && (
        <div className="art-frame rounded-2xl p-8 text-center border border-terra/30 bg-terra/5 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-terra mx-auto mb-3" />
          <h3 className="font-display text-2xl font-bold text-ink">Erro ao carregar aulas</h3>
          <p className="mt-2 text-sm text-ink-soft">{erro}</p>
          <button
            onClick={() => carregarAulas(false)}
            className="ink-btn mt-5 px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar de novo</span>
          </button>
        </div>
      )}

      {/* Busca sem resultados */}
      {!carregando && !erro && aulasFiltradas.length === 0 && aulas.length > 0 && (
        <div className="art-frame rounded-2xl p-10 text-center border border-gold/30 max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 opacity-50">
            <ArtFigure pose="scholar" inView={true} className="w-full h-full text-ink" />
          </div>
          <h3 className="font-display text-2xl font-bold text-ink">Nenhuma aula encontrada</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Não encontramos nenhuma aula para "{termoBusca}". Tente outro termo ou limpe os filtros.
          </p>
          <button
            onClick={() => {
              setTermoBusca('');
              setDisciplinaAtiva('Todas');
            }}
            className="gold-outline-btn mt-5 px-5 py-2 rounded-full text-xs font-semibold"
          >
            Limpar busca e filtros
          </button>
        </div>
      )}

      {/* Biblioteca totalmente vazia */}
      {!carregando && !erro && aulas.length === 0 && (
        <div className="art-frame rounded-2xl p-12 text-center border border-gold/30 max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 opacity-40">
            <ArtFigure pose="scholar" inView={true} className="w-full h-full text-ink" />
          </div>
          <h3 className="font-display text-2xl font-bold text-ink">Ainda não há aulas por aqui</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Assim que seu professor cadastrar e processar as primeiras aulas com áudio e fotos, elas aparecerão automaticamente aqui.
          </p>
        </div>
      )}

      {/* Listagem agrupada por disciplina */}
      {!carregando && !erro && gruposDisciplinas.length > 0 && (
        <div className="space-y-12">
          {gruposDisciplinas.map((grupo) => (
            <section key={grupo.materia} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-ink">
                  <BookOpen className="w-4 h-4 text-terra" />
                </div>
                <h2 className="font-display text-3xl font-bold text-ink">
                  {grupo.materia}
                </h2>
                <span className="text-xs text-ink-soft/70 font-semibold px-2 py-0.5 rounded bg-ink/5">
                  {grupo.aulas.length} {grupo.aulas.length === 1 ? 'aula' : 'aulas'}
                </span>
                <div className="flex-1 h-px bg-gold/25 ml-2" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {grupo.aulas.map((aula) => (
                  <CartaoAula key={aula.id} aula={aula} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
