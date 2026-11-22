import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '../../api/cliente.ts';
import { ApiError, LessonResponse, LessonStatus } from '../../api/tipos.ts';
import ConfirmarDialogo from '../../components/ui/ConfirmarDialogo.tsx';
import EmblemaPreparando from '../../components/EmblemaPreparando.tsx';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, RefreshCw, RotateCw, Trash2 } from 'lucide-react';

interface AcompanhamentoProps {
  aulaId: number;
  /** Muda quando o painel quer forçar uma nova consulta (depois de um envio). */
  tokenAtualizacao: number;
  /** Avisa o painel quando o status da aula muda, para atualizar a lista. */
  onStatusMudou: () => void;
  /** Chamado depois que a aula foi excluída no servidor (o painel limpa a seleção e recarrega a lista). */
  onExcluida: () => void;
  /** Conteúdo exibido abaixo do status quando a aula carregou (envio de áudio e fotos). */
  children: (aula: LessonResponse) => ReactNode;
}

const INTERVALO_PROCESSAMENTO_MS = 3000;

const PILULA: Record<LessonStatus, { classe: string; rotulo: string }> = {
  CREATED: { classe: '', rotulo: 'Aguardando áudio' },
  PROCESSING: { classe: 'av-pill-aviso', rotulo: 'Em processamento' },
  DONE: { classe: 'av-pill-sucesso', rotulo: 'Pronta para os alunos' },
  FAILED: { classe: 'av-pill-erro', rotulo: 'Falhou' },
};

function formatarDataHora(dataIso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Fortaleza',
    }).format(new Date(dataIso));
  } catch {
    return '';
  }
}

export default function AcompanhamentoProcessamento({
  aulaId,
  tokenAtualizacao,
  onStatusMudou,
  onExcluida,
  children,
}: AcompanhamentoProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [aula, setAula] = useState<LessonResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [reprocessando, setReprocessando] = useState(false);
  const [retorno, setRetorno] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const statusAnterior = useRef<LessonStatus | null>(null);
  const onStatusMudouRef = useRef(onStatusMudou);
  useEffect(() => {
    onStatusMudouRef.current = onStatusMudou;
  }, [onStatusMudou]);

  const jaCarregouRef = useRef(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const buscar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCarregando(true);
      try {
        const dados = await api.obterAula(aulaId);
        const anterior = statusAnterior.current;
        statusAnterior.current = dados.status;
        jaCarregouRef.current = true;
        setAula(dados);
        setErro(null);
        if (anterior !== null && anterior !== dados.status) onStatusMudouRef.current();
      } catch (e: unknown) {
        const msg =
          e && typeof e === 'object' && 'status' in e && Number((e as { status: number }).status) === 404
            ? 'Esta aula não foi encontrada. Ela pode ter sido removida.'
            : 'Não foi possível consultar a aula agora. Verifique a conexão com o servidor.';
        // Falha em consulta automática com a aula já na tela: mantém o que está visível.
        if (!silencioso || !jaCarregouRef.current) setErro(msg);
      } finally {
        setCarregando(false);
      }
    },
    [aulaId]
  );

  // Primeira consulta e consultas pedidas pelo painel (token)
  useEffect(() => {
    void buscar(jaCarregouRef.current);
  }, [buscar, tokenAtualizacao]);

  // Enquanto estiver em PROCESSING, consulta a cada 3 segundos
  const emProcessamento = aula?.status === 'PROCESSING';
  useEffect(() => {
    if (!emProcessamento) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void buscar(true);
    }, INTERVALO_PROCESSAMENTO_MS);
    return () => clearInterval(timer);
  }, [emProcessamento, buscar]);

  // Ao abrir uma aula, leva o foco para o título (leitores de tela anunciam a troca)
  const aulaCarregadaId = aula?.id;
  useEffect(() => {
    if (aulaCarregadaId !== undefined) tituloRef.current?.focus({ preventScroll: true });
  }, [aulaCarregadaId]);

  const reprocessar = async () => {
    setReprocessando(true);
    setRetorno(null);
    try {
      await api.reprocessar(aulaId);
      setRetorno({ tipo: 'ok', texto: 'Reprocessamento iniciado. Acompanhe o status aqui.' });
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'status' in err ? Number((err as { status: number }).status) : 0;
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Não foi possível reprocessar a aula.';
      setRetorno({
        tipo: 'erro',
        texto: status === 409 ? 'A aula já está sendo processada. Aguarde o término.' : msg,
      });
    } finally {
      setReprocessando(false);
      await buscar(true);
      onStatusMudouRef.current();
    }
  };

  const excluir = async () => {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await api.excluirAula(aulaId);
      setConfirmando(false);
      onExcluida();
    } catch (err) {
      setErroExclusao((err as ApiError).message);
      setExcluindo(false);
    }
  };

  if (carregando && !aula) {
    return (
      <div className="av-prof-cartao" role="status" aria-busy="true">
        <span className="sr-only">Carregando aula…</span>
        <div aria-hidden="true" className="av-prof-esq" style={{ height: '1.6rem', width: '8rem', borderRadius: '999px' }} />
        <div aria-hidden="true" className="av-prof-esq" style={{ height: '2.2rem', width: '80%', marginTop: '0.9rem' }} />
        <div aria-hidden="true" className="av-prof-esq" style={{ height: '8rem', marginTop: '1.25rem' }} />
      </div>
    );
  }

  if (erro && !aula) {
    return (
      <div className="av-estado av-estado-erro" role="alert">
        <div className="av-estado-icone">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="av-estado-titulo">Não foi possível abrir a aula</h2>
        <p className="av-estado-texto">{erro}</p>
        <button type="button" className="av-btn av-btn-primario mt-5" onClick={() => void buscar(false)}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Tentar de novo</span>
        </button>
      </div>
    );
  }

  if (!aula) return null;

  const pilula = PILULA[aula.status];
  const podeReprocessar = aula.status === 'FAILED' || aula.status === 'DONE';

  return (
    <div className="av-prof-espaco">
      <header className="av-prof-cartao">
        <div className="av-prof-status-topo">
          <span className="av-prof-tag">{aula.subject}</span>
          <time className="av-prof-data" dateTime={aula.createdAt}>
            Criada em {formatarDataHora(aula.createdAt)}
          </time>
        </div>
        <h2 className="av-prof-aula-titulo" tabIndex={-1} ref={tituloRef}>
          {aula.title}
        </h2>

        <div role="status" className="av-prof-status-corpo">
          <span className={`av-pill ${pilula.classe}`}>
            {aula.status === 'PROCESSING' && <span className="av-prof-ponto-vivo" aria-hidden="true" />}
            {aula.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
            {pilula.rotulo}
          </span>

          {aula.status === 'CREATED' && (
            <p className="av-prof-ajuda">Envie o áudio abaixo para a IA começar a preparar o resumo.</p>
          )}
          {aula.status === 'PROCESSING' && (
            <div className="av-prof-processando">
              <EmblemaPreparando inView={true} className="av-prof-emblema-proc anim-float-soft" />
              <p className="av-prof-ajuda">
                A IA está transcrevendo o áudio e preparando o resumo. Esta área consulta o servidor a cada 3 segundos
                e atualiza sozinha.
              </p>
            </div>
          )}
          {aula.status === 'DONE' && (
            <p className="av-prof-ajuda">Os alunos já veem esta aula na página de aulas.</p>
          )}
        </div>

        {aula.status === 'FAILED' && (
          <div className="av-prof-falha" role="alert">
            <p className="av-prof-falha-titulo">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              O processamento falhou
            </p>
            <p className="av-prof-falha-texto">
              {aula.failureReason?.trim() || 'O servidor não informou o motivo.'}
            </p>
            <p className="av-prof-falha-nota">Só você vê esta mensagem. Os alunos não têm acesso a ela.</p>
          </div>
        )}

        {retorno && (
          <p
            className={`av-prof-aviso ${retorno.tipo === 'ok' ? 'av-prof-aviso-ok' : 'av-prof-aviso-erro'}`}
            role={retorno.tipo === 'ok' ? 'status' : 'alert'}
          >
            {retorno.tipo === 'ok' ? (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{retorno.texto}</span>
          </p>
        )}

        <div className="av-prof-linha-acoes">
          {podeReprocessar && (
            <button
              type="button"
              className={`av-btn ${aula.status === 'FAILED' ? 'av-btn-primario' : 'av-btn-contorno'}`}
              onClick={reprocessar}
              disabled={reprocessando}
            >
              {reprocessando ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCw className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{reprocessando ? 'Reprocessando…' : 'Reprocessar aula'}</span>
            </button>
          )}
          <button
            type="button"
            className="av-btn av-btn-contorno av-btn-perigo"
            onClick={() => {
              setErroExclusao(null);
              setConfirmando(true);
            }}
            disabled={aula.status === 'PROCESSING'}
            title={aula.status === 'PROCESSING' ? 'Aguarde o fim do processamento para excluir' : undefined}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Excluir aula</span>
          </button>
          {aula.status === 'DONE' && (
            <a className="av-btn av-btn-suave" href={`#/aulas/${aula.id}`}>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span>Ver como aluno</span>
            </a>
          )}
        </div>
        {aula.status === 'DONE' && (
          <p className="av-prof-nota">
            Adicionou novas mídias depois do processamento? Reprocesse a aula para que elas entrem no resultado.
          </p>
        )}
      </header>

      {erro && (
        <p className="av-prof-aviso av-prof-aviso-erro" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{erro}</span>
        </p>
      )}

      <div className="av-prof-cartao av-prof-envios">{children(aula)}</div>

      <ConfirmarDialogo
        aberto={confirmando}
        titulo="Excluir esta aula?"
        descricao={`“${aula.title}” será apagada junto com o áudio, o resumo, os slides e todas as fotos. Esta ação não pode ser desfeita.`}
        rotuloConfirmar="Excluir aula"
        ocupado={excluindo}
        erro={erroExclusao}
        onConfirmar={() => void excluir()}
        onCancelar={() => setConfirmando(false)}
      />
    </div>
  );
}
