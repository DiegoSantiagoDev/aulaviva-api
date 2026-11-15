import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { api } from '../../api/cliente';
import { LessonListItem } from '../../api/tipos';
import CartaoAula from './CartaoAula';
import FiltroDisciplinas from './FiltroDisciplinas';
import EsqueletoAulas from './EsqueletoAulas';
import EmblemaBoasVindas from '../../components/EmblemaBoasVindas';
import EmblemaLeitura from '../../components/EmblemaLeitura';
import EmblemaPerdido from '../../components/EmblemaPerdido';
import { tomDaDisciplina } from '../../lib/tomDisciplina';
import { Search, X, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import './aulas.css';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function textoQuantidade(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export default function BibliotecaAulas() {
  const [aulas, setAulas] = useState<LessonListItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [termoDebounced, setTermoDebounced] = useState('');
  const [disciplinaAtiva, setDisciplinaAtiva] = useState('Todas');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const campoBuscaRef = useRef<HTMLInputElement>(null);
  const jaCarregouRef = useRef(false);

  // Debounce de 200ms na digitação da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermoDebounced(termoBusca);
    }, 200);
    return () => clearTimeout(handler);
  }, [termoBusca]);

  const carregarAulas = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const lista = await api.listarAulas();
      // Regra 1: Somente aulas com status DONE
      // Regra 2: Esconder aulas com hidden verdadeiro
      const aulasValidas = lista.filter(
        (a) => a.status === 'DONE' && a.hidden !== true
      );
      setAulas(aulasValidas);
      setErro(null);
      jaCarregouRef.current = true;
      setUltimaAtualizacao(new Date());
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e
        ? String((e as { message: string }).message)
        : 'Não foi possível carregar as aulas. Verifique a conexão com o servidor.';
      // Falha na atualização automática com a lista já na tela: mantém a lista.
      if (!silencioso || !jaCarregouRef.current) setErro(msg);
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

  const temAulas = aulas.length > 0;
  const mostrarLista = !carregando && !erro && gruposDisciplinas.length > 0;
  const semResultado = !carregando && !erro && temAulas && aulasFiltradas.length === 0;
  const bibliotecaVazia = !carregando && !erro && !temAulas;

  const limparBusca = () => {
    setTermoBusca('');
    campoBuscaRef.current?.focus();
  };

  const limparTudo = () => {
    setTermoBusca('');
    setDisciplinaAtiva('Todas');
  };

  return (
    <div className="av-pagina av-bib anim-fade-up space-y-8">
      {/* Topo: emblema de boas-vindas, título e situação da lista */}
      <header className="av-topo">
        <EmblemaBoasVindas inView={true} className="av-emblema" />
        <div className="flex-1 min-w-0">
          <h1 className="av-titulo">Biblioteca de aulas</h1>
          <p className="av-lead">
            Aqui ficam as aulas com processamento concluído. Abra uma aula para estudar pelo resumo,
            pelos slides e pelas fotos do quadro.
          </p>

          <div className="av-resumo">
            {temAulas && (
              <span>
                <strong>{textoQuantidade(aulas.length, 'aula', 'aulas')}</strong> em{' '}
                {textoQuantidade(disciplinasComContagem.length, 'disciplina', 'disciplinas')}
              </span>
            )}
            <span className="av-atualizado">
              <span className="av-ponto-ok" aria-hidden="true" />
              Atualizado às{' '}
              {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              type="button"
              className="av-btn av-btn-suave"
              onClick={() => carregarAulas(false)}
              disabled={carregando}
              aria-busy={carregando}
            >
              <RefreshCw size={14} className={carregando ? 'animate-spin' : undefined} aria-hidden="true" />
              <span>Atualizar lista</span>
            </button>
          </div>
        </div>
      </header>

      {/* Busca e filtros: só fazem sentido quando já existem aulas */}
      {temAulas && (
        <section className="space-y-5" aria-label="Buscar e filtrar aulas">
          <div className="av-busca">
            <label htmlFor="av-busca-campo" className="sr-only">
              Buscar aulas por título ou disciplina
            </label>
            <Search className="av-busca-icone" aria-hidden="true" />
            <input
              ref={campoBuscaRef}
              id="av-busca-campo"
              type="text"
              inputMode="search"
              autoComplete="off"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por título ou disciplina"
              className="av-busca-campo"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={limparBusca}
                className="av-busca-limpar"
                aria-label="Limpar busca"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          <FiltroDisciplinas
            disciplinas={disciplinasComContagem}
            selecionada={disciplinaAtiva}
            onSelecionar={setDisciplinaAtiva}
            totalAulas={aulas.length}
          />
        </section>
      )}

      {/* Anúncio para leitores de tela (a busca atualiza a lista sem mudar de página) */}
      {!carregando && !erro && temAulas && (
        <p className="sr-only" role="status" aria-live="polite">
          {aulasFiltradas.length === 0
            ? 'Nenhuma aula encontrada.'
            : `${textoQuantidade(aulasFiltradas.length, 'aula encontrada', 'aulas encontradas')}.`}
        </p>
      )}

      {/* Estado: carregando */}
      {carregando && <EsqueletoAulas />}

      {/* Estado: erro */}
      {erro && !carregando && (
        <div className="av-estado av-estado-erro" role="alert">
          <div className="av-estado-icone">
            <AlertCircle size={28} aria-hidden="true" />
          </div>
          <h2 className="av-estado-titulo">Não foi possível carregar as aulas</h2>
          <p className="av-estado-texto">{erro}</p>
          <button
            type="button"
            onClick={() => carregarAulas(false)}
            className="av-btn av-btn-erro mt-5"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Tentar de novo</span>
          </button>
        </div>
      )}

      {/* Estado: busca ou filtro sem resultado */}
      {semResultado && (
        <div className="av-estado av-estado-vazio">
          <EmblemaPerdido inView={true} className="av-emblema-mini" />
          <h2 className="av-estado-titulo">Nenhuma aula encontrada</h2>
          <p className="av-estado-texto">
            {termoDebounced.trim()
              ? `Nenhuma aula combina com “${termoDebounced.trim()}”. Confira a escrita ou tente outro termo.`
              : 'Não há aulas com este filtro. Volte para todas as disciplinas para ver a lista completa.'}
          </p>
          <button type="button" onClick={limparTudo} className="av-btn av-btn-contorno mt-5">
            Limpar busca e filtros
          </button>
        </div>
      )}

      {/* Estado: biblioteca ainda sem aulas */}
      {bibliotecaVazia && (
        <div className="av-estado av-estado-vazio">
          <EmblemaLeitura inView={true} className="av-emblema-mini" />
          <h2 className="av-estado-titulo">Ainda não há aulas por aqui</h2>
          <p className="av-estado-texto">
            Quando o professor enviar o áudio de uma aula e o processamento terminar, ela aparece
            aqui automaticamente.
          </p>
        </div>
      )}

      {/* Listagem agrupada por disciplina */}
      {mostrarLista && (
        <div className="space-y-12">
          {gruposDisciplinas.map((grupo, indice) => {
            const idTitulo = `av-grupo-${indice}`;
            return (
              <section
                key={grupo.materia}
                className="space-y-5"
                data-tom={tomDaDisciplina(grupo.materia)}
                aria-labelledby={idTitulo}
              >
                <div className="av-grupo-cab">
                  <span className="av-grupo-icone" aria-hidden="true">
                    <BookOpen size={16} />
                  </span>
                  <h2 id={idTitulo} className="av-grupo-titulo">
                    {grupo.materia}
                  </h2>
                  <span className="av-grupo-qtd">{textoQuantidade(grupo.aulas.length, 'aula', 'aulas')}</span>
                  <span className="av-grupo-linha" aria-hidden="true" />
                </div>

                <ul className="av-grade">
                  {grupo.aulas.map((aula) => (
                    <li key={aula.id}>
                      <CartaoAula aula={aula} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
