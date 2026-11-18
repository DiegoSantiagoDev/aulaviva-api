import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, ShieldAlert, UserCheck, UserX, Users } from 'lucide-react';
import { api } from '../../api/cliente.ts';
import type { ApiError, StatusConta, UserSummary } from '../../api/tipos.ts';
import ConfirmarDialogo from '../../components/ui/ConfirmarDialogo.tsx';
import IndicadorCarregamento from '../../components/ui/IndicadorCarregamento.tsx';
import { gsap, useGSAP } from '../../animacoes/motor.ts';
import { DURACAO, EASE, prefereMovimentoReduzido } from '../../animacoes/movimento.ts';
import './admin.css';

type Listas = Record<StatusConta, UserSummary[]>;
const ORDEM: StatusConta[] = ['PENDING', 'APPROVED', 'REJECTED'];
const ROTULO: Record<StatusConta, string> = {
  PENDING: 'Aguardando aprovação',
  APPROVED: 'Aprovados',
  REJECTED: 'Rejeitados',
};
const VAZIO: Record<StatusConta, string> = {
  PENDING: 'Nenhum professor aguardando aprovação neste momento.',
  APPROVED: 'Nenhum professor aprovado ainda.',
  REJECTED: 'Nenhum cadastro rejeitado.',
};

type Feedback = { tipo: 'ok' | 'erro'; texto: string } | null;

function formatarData(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Painel administrativo. Usa apenas os três endpoints reais:
 * GET /api/admin/users?status=, POST …/{id}/approve e POST …/{id}/reject.
 */
export default function PainelAdmin() {
  const [listas, setListas] = useState<Listas | null>(null);
  const [erro, setErro] = useState<ApiError | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<StatusConta>('PENDING');
  const [ocupados, setOcupados] = useState<ReadonlySet<number>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [revogar, setRevogar] = useState<UserSummary | null>(null);
  const raiz = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [pendentes, aprovados, rejeitados] = await Promise.all(ORDEM.map((s) => api.listarProfessores(s)));
      setListas({ PENDING: pendentes, APPROVED: aprovados, REJECTED: rejeitados });
    } catch (e) {
      setErro(e as ApiError);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const decidir = async (usuario: UserSummary, acao: 'aprovar' | 'rejeitar') => {
    setOcupados((atual) => new Set(atual).add(usuario.id));
    setFeedback(null);
    try {
      const atualizado = acao === 'aprovar' ? await api.aprovarProfessor(usuario.id) : await api.rejeitarProfessor(usuario.id);
      setListas((prev) => {
        if (!prev) return prev;
        const sem = (l: UserSummary[]) => l.filter((u) => u.id !== atualizado.id);
        return {
          PENDING: sem(prev.PENDING),
          APPROVED: sem(prev.APPROVED),
          REJECTED: sem(prev.REJECTED),
          [atualizado.status]: [atualizado, ...sem(prev[atualizado.status])],
        };
      });
      setFeedback({
        tipo: 'ok',
        texto: acao === 'aprovar' ? `${atualizado.name} foi aprovado(a) e já pode entrar.` : `O cadastro de ${atualizado.name} foi rejeitado.`,
      });
    } catch (e) {
      setFeedback({ tipo: 'erro', texto: (e as ApiError).message });
    } finally {
      setOcupados((atual) => {
        const proximo = new Set(atual);
        proximo.delete(usuario.id);
        return proximo;
      });
      setRevogar(null);
    }
  };

  // Entrada coreografada: o número gigante e a lista "acendem" em sequência.
  useGSAP(
    () => {
      if (prefereMovimentoReduzido() || carregando || !listas) return;
      gsap.from('.av-adm-cabeca > *', { y: 26, autoAlpha: 0, duration: DURACAO.cena, ease: EASE.acender, stagger: 0.09 });
      gsap.from('.av-adm-item', { y: 18, autoAlpha: 0, duration: DURACAO.cena, ease: EASE.acender, stagger: 0.06, delay: 0.2 });
    },
    { scope: raiz, dependencies: [aba, carregando], revertOnUpdate: true }
  );

  const lista = listas?.[aba] ?? [];

  return (
    <div ref={raiz} className="av-adm">
      <header className="av-adm-cabeca">
        <p className="av-rotulo">Administração</p>
        <h1 className="av-adm-titulo">Quem pode ensinar aqui</h1>
        <p className="av-lead">
          Aprove ou rejeite os professores cadastrados. Só professores aprovados conseguem entrar e enviar aulas.
        </p>
      </header>

      {carregando && <IndicadorCarregamento rotulo="Carregando professores…" />}

      {!carregando && erro && (
        <div className="av-estado av-estado-erro" role="alert">
          <div className="av-estado-icone">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="av-estado-titulo">Não foi possível carregar os professores</h2>
          <p className="av-estado-texto">{erro.message}</p>
          <button type="button" className="av-btn av-btn-contorno" onClick={() => void carregar()}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {!carregando && listas && (
        <>
          <div className="av-adm-barra">
            <div className="av-adm-abas" role="group" aria-label="Filtrar por situação">
              {ORDEM.map((s) => (
                <button key={s} type="button" className="av-chip" aria-pressed={aba === s} onClick={() => setAba(s)}>
                  <span>{ROTULO[s]}</span>
                  <span className="av-chip-qtd">{listas[s].length}</span>
                </button>
              ))}
            </div>
            <button type="button" className="av-btn av-btn-suave" onClick={() => void carregar()}>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Atualizar</span>
            </button>
          </div>

          <div aria-live="polite" className="av-adm-feedback">
            {feedback && (
              <div className={`av-aviso ${feedback.tipo === 'ok' ? 'av-aviso-ok' : 'av-aviso-erro'}`} role={feedback.tipo === 'ok' ? 'status' : 'alert'}>
                {feedback.tipo === 'ok' ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <ShieldAlert className="w-4 h-4" aria-hidden="true" />}
                <span>{feedback.texto}</span>
              </div>
            )}
          </div>

          {lista.length === 0 ? (
            <div className="av-estado av-estado-vazio">
              <div className="av-estado-icone">
                <Users className="w-6 h-6" aria-hidden="true" />
              </div>
              <p className="av-estado-texto">{VAZIO[aba]}</p>
            </div>
          ) : (
            <ul className="av-adm-lista">
              {lista.map((u) => {
                const trabalhando = ocupados.has(u.id);
                return (
                  <li key={u.id} className="av-adm-item" aria-busy={trabalhando}>
                    <span className="av-adm-avatar" aria-hidden="true">
                      {u.name.trim().charAt(0).toUpperCase() || '?'}
                    </span>
                    <div className="av-adm-dados">
                      <p className="av-adm-nome">{u.name}</p>
                      <p className="av-adm-email">{u.email}</p>
                      <p className="av-rotulo">Cadastro em {formatarData(u.createdAt)}</p>
                    </div>
                    <div className="av-linha-acoes av-adm-acoes">
                      {u.status !== 'APPROVED' && (
                        <button type="button" className="av-btn av-btn-primario" disabled={trabalhando} onClick={() => void decidir(u, 'aprovar')}>
                          {trabalhando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <UserCheck className="w-4 h-4" aria-hidden="true" />}
                          <span>Aprovar</span>
                        </button>
                      )}
                      {u.status !== 'REJECTED' && (
                        <button
                          type="button"
                          className="av-btn av-btn-contorno"
                          disabled={trabalhando}
                          onClick={() => (u.status === 'APPROVED' ? setRevogar(u) : void decidir(u, 'rejeitar'))}
                        >
                          <UserX className="w-4 h-4" aria-hidden="true" />
                          <span>{u.status === 'APPROVED' ? 'Revogar' : 'Rejeitar'}</span>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmarDialogo
        aberto={revogar !== null}
        titulo="Revogar o acesso deste professor?"
        descricao={revogar ? `${revogar.name} será marcado(a) como rejeitado(a) e não conseguirá mais entrar. As aulas já enviadas continuam existindo.` : ''}
        rotuloConfirmar="Revogar acesso"
        rotuloOcupado="Revogando…"
        ocupado={revogar ? ocupados.has(revogar.id) : false}
        onConfirmar={() => revogar && void decidir(revogar, 'rejeitar')}
        onCancelar={() => setRevogar(null)}
      />
    </div>
  );
}
