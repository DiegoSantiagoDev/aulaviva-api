import { LessonListItem, LessonStatus } from '../../api/tipos.ts';
import { AlertCircle, CheckCircle2, ClipboardList, Clock, RefreshCw, Search } from 'lucide-react';
import EmblemaProfessor from '../../components/EmblemaProfessor.tsx';

export type FiltroStatus = 'TODAS' | LessonStatus;

export const FILTROS: { id: FiltroStatus; rotulo: string }[] = [
  { id: 'TODAS', rotulo: 'Todas' },
  { id: 'CREATED', rotulo: 'Aguardando áudio' },
  { id: 'PROCESSING', rotulo: 'Processando' },
  { id: 'DONE', rotulo: 'Prontas' },
  { id: 'FAILED', rotulo: 'Com falha' },
];

const ROTULO_STATUS: Record<LessonStatus, { texto: string; classe: string }> = {
  CREATED: { texto: 'Aguardando áudio', classe: '' },
  PROCESSING: { texto: 'Processando', classe: 'av-pill-aviso' },
  DONE: { texto: 'Pronta', classe: 'av-pill-sucesso' },
  FAILED: { texto: 'Falhou', classe: 'av-pill-erro' },
};

interface ListaAulasProfessorProps {
  aulas: LessonListItem[];
  carregando: boolean;
  erro: string | null;
  filtro: FiltroStatus;
  onFiltro: (f: FiltroStatus) => void;
  selecionadaId: number | null;
  onSelecionar: (id: number) => void;
  onRecarregar: () => void;
  ultimaAtualizacao: Date;
}

function formatarData(dataIso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Fortaleza' }).format(
      new Date(dataIso)
    );
  } catch {
    return '';
  }
}

export default function ListaAulasProfessor({
  aulas,
  carregando,
  erro,
  filtro,
  onFiltro,
  selecionadaId,
  onSelecionar,
  onRecarregar,
  ultimaAtualizacao,
}: ListaAulasProfessorProps) {
  const contagem = (f: FiltroStatus) => (f === 'TODAS' ? aulas.length : aulas.filter((a) => a.status === f).length);
  const visiveis = (filtro === 'TODAS' ? aulas : aulas.filter((a) => a.status === filtro))
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="av-prof-cartao" aria-labelledby="av-prof-lista-h">
      <div className="av-prof-lista-topo">
        <h2 className="av-prof-h2" id="av-prof-lista-h">Suas aulas</h2>
        <button
          type="button"
          className="av-btn av-btn-suave av-prof-btn-icone"
          onClick={onRecarregar}
          disabled={carregando}
          aria-label="Atualizar a lista de aulas"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>Atualizar</span>
        </button>
      </div>

      {!erro && aulas.length > 0 && (
        <p className="av-prof-ajuda">
          A lista atualiza sozinha a cada 10 segundos. Última atualização às{' '}
          {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
        </p>
      )}

      {aulas.length > 0 && (
        <div className="av-filtros" role="group" aria-label="Filtrar por status">
          {FILTROS.map((f) => (
            <button
              type="button"
              key={f.id}
              className="av-chip"
              aria-pressed={filtro === f.id}
              onClick={() => onFiltro(f.id)}
            >
              <span>{f.rotulo}</span>
              <span className="av-chip-qtd">{contagem(f.id)}</span>
            </button>
          ))}
        </div>
      )}

      {carregando && aulas.length === 0 && !erro && (
        <div role="status" aria-busy="true" className="av-prof-lista-esq">
          <span className="sr-only">Carregando aulas…</span>
          {[1, 2, 3].map((i) => (
            <div key={i} aria-hidden="true" className="av-prof-esq" style={{ height: '4.5rem' }} />
          ))}
        </div>
      )}

      {erro && (
        <div className="av-estado av-estado-erro av-prof-estado" role="alert">
          <div className="av-estado-icone">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="av-estado-titulo">Não foi possível carregar as aulas</h3>
          <p className="av-estado-texto">{erro}</p>
          <button type="button" className="av-btn av-btn-primario mt-5" onClick={onRecarregar}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Tentar de novo</span>
          </button>
        </div>
      )}

      {!carregando && !erro && aulas.length === 0 && (
        <div className="av-estado av-estado-vazio av-prof-estado">
          <EmblemaProfessor inView={true} className="av-emblema-mini" />
          <h3 className="av-estado-titulo">Você ainda não criou aulas</h3>
          <p className="av-estado-texto">Use o formulário “Nova aula” para cadastrar a primeira.</p>
        </div>
      )}

      {!erro && aulas.length > 0 && visiveis.length === 0 && (
        <div className="av-estado av-estado-vazio av-prof-estado">
          <div className="av-estado-icone">
            <Search className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="av-estado-titulo">Nenhuma aula neste status</h3>
          <p className="av-estado-texto">Escolha outro filtro para ver as demais aulas.</p>
          <button type="button" className="av-btn av-btn-contorno mt-5" onClick={() => onFiltro('TODAS')}>
            Mostrar todas
          </button>
        </div>
      )}

      {!erro && visiveis.length > 0 && (
        <ul className="av-prof-lista" role="list">
          {visiveis.map((aula) => {
            const st = ROTULO_STATUS[aula.status];
            const ativa = aula.id === selecionadaId;
            return (
              <li key={aula.id}>
                <button
                  type="button"
                  className="av-prof-item"
                  aria-current={ativa ? 'true' : undefined}
                  onClick={() => onSelecionar(aula.id)}
                >
                  <span className="av-prof-item-titulo">{aula.title}</span>
                  <span className="av-prof-item-meta">
                    <span>{aula.subject}</span>
                    <span className="av-prof-item-data">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatarData(aula.createdAt)}
                    </span>
                  </span>
                  <span className={`av-pill ${st.classe} av-prof-item-pill`}>
                    {aula.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                    {aula.status === 'FAILED' && <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                    {aula.status === 'CREATED' && <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />}
                    {aula.status === 'PROCESSING' && <span className="av-prof-ponto-vivo" aria-hidden="true" />}
                    {st.texto}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
