import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api/cliente.ts';
import { LessonListItem, LessonResponse } from '../../api/tipos.ts';
import EmblemaProfessor from '../../components/EmblemaProfessor.tsx';
import FormNovaAula from './FormNovaAula.tsx';
import ListaAulasProfessor, { type FiltroStatus } from './ListaAulasProfessor.tsx';
import AcompanhamentoProcessamento from './AcompanhamentoProcessamento.tsx';
import UploadAudioProgresso from './UploadAudioProgresso.tsx';
import UploadFotosCanvas from './UploadFotosCanvas.tsx';
import './professor.css';

const INTERVALO_LISTA_MS = 10000;

export default function PainelProfessor() {
  const [aulas, setAulas] = useState<LessonListItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroStatus>('TODAS');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [tokenAtualizacao, setTokenAtualizacao] = useState(0);

  const espacoRef = useRef<HTMLDivElement>(null);
  const jaCarregouRef = useRef(false);

  const carregarAulas = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const lista = await api.listarAulas();
      setAulas(lista);
      setErro(null);
      jaCarregouRef.current = true;
      setUltimaAtualizacao(new Date());
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Não foi possível carregar as aulas. Verifique a conexão com o servidor.';
      // Falha na atualização automática com a lista já na tela: mantém a lista.
      if (!silencioso || !jaCarregouRef.current) setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarAulas();

    // Atualiza a lista a cada 10 segundos com a aba visível
    const intervalo = setInterval(() => {
      if (document.visibilityState === 'visible') void carregarAulas(true);
    }, INTERVALO_LISTA_MS);

    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'visible') void carregarAulas(true);
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    };
  }, [carregarAulas]);

  const disciplinas = useMemo(
    () =>
      Array.from(new Set(aulas.map((a) => a.subject))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      ),
    [aulas]
  );

  /** Leva a tela para a aula escolhida (no celular o painel fica abaixo da lista). */
  const irParaEspaco = () => {
    requestAnimationFrame(() => {
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      espacoRef.current?.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const selecionar = (id: number) => {
    setSelecionadaId(id);
    irParaEspaco();
  };

  const aoCriar = (aula: LessonResponse) => {
    setFiltro('TODAS');
    setSelecionadaId(aula.id);
    void carregarAulas(true);
    irParaEspaco();
  };

  const pedirAtualizacao = () => {
    setTokenAtualizacao((t) => t + 1);
    void carregarAulas(true);
  };

  return (
    <div className="av-pagina av-prof anim-fade-up">
      <header className="av-topo">
        <EmblemaProfessor inView={true} className="av-emblema" />
        <div className="flex-1">
          <h1 className="av-titulo">Painel do professor</h1>
          <p className="av-lead">
            Cadastre a aula, envie o áudio e as fotos do quadro e acompanhe o processamento. Os alunos só veem a aula
            quando ela fica pronta.
          </p>
        </div>
      </header>

      <div className="av-prof-grade">
        <div className="av-prof-coluna">
          <FormNovaAula disciplinas={disciplinas} onCriada={aoCriar} />
          <ListaAulasProfessor
            aulas={aulas}
            carregando={carregando}
            erro={erro}
            filtro={filtro}
            onFiltro={setFiltro}
            selecionadaId={selecionadaId}
            onSelecionar={selecionar}
            onRecarregar={() => void carregarAulas(false)}
            ultimaAtualizacao={ultimaAtualizacao}
          />
        </div>

        <div className="av-prof-coluna" ref={espacoRef}>
          {selecionadaId === null ? (
            <div className="av-estado av-estado-vazio av-prof-estado">
              <EmblemaProfessor inView={true} className="av-emblema-mini" />
              <h2 className="av-estado-titulo">Escolha uma aula</h2>
              <p className="av-estado-texto">
                Selecione uma aula da lista ou crie uma nova para enviar áudio e fotos e acompanhar o processamento.
              </p>
            </div>
          ) : (
            <AcompanhamentoProcessamento
              key={selecionadaId}
              aulaId={selecionadaId}
              tokenAtualizacao={tokenAtualizacao}
              onStatusMudou={() => void carregarAulas(true)}
              onExcluida={() => {
                setSelecionadaId(null);
                void carregarAulas(true);
              }}
            >
              {(aula) => (
                <>
                  <UploadAudioProgresso
                    aulaId={aula.id}
                    bloqueado={aula.status === 'PROCESSING'}
                    motivoBloqueio="Aguarde o fim do processamento para enviar outro áudio."
                    onEnviado={pedirAtualizacao}
                  />
                  <UploadFotosCanvas
                    aulaId={aula.id}
                    jaEnviadas={aula.images}
                    bloqueado={aula.status === 'PROCESSING'}
                    onEnviadas={pedirAtualizacao}
                    onExcluida={pedirAtualizacao}
                  />
                </>
              )}
            </AcompanhamentoProcessamento>
          )}
        </div>
      </div>
    </div>
  );
}
