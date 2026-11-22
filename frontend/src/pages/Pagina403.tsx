import { ShieldOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.tsx';
import { useRoteador } from '../app/Roteador.tsx';
import { destinoPosLogin } from '../auth/rotas.ts';

const ROTULO_PAPEL = { ADMIN: 'administrador', PROFESSOR: 'professor', ALUNO: 'aluno' } as const;

/** Acesso negado no frontend (papel sem permissão para a rota). O backend também recusaria. */
export default function Pagina403() {
  const { sessao } = useAuth();
  const { navegar } = useRoteador();

  return (
    <div className="av-pagina-centro">
      <section className="av-estado av-estado-aviso" style={{ maxWidth: '30rem' }}>
        <div className="av-estado-icone">
          <ShieldOff className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="av-estado-titulo">Esta área não é para o seu perfil</h1>
        <p className="av-estado-texto">
          {sessao
            ? `Você entrou como ${ROTULO_PAPEL[sessao.papel]}, e este espaço pede outra permissão.`
            : 'Você precisa entrar para ver esta área.'}
        </p>
        <div className="av-linha-acoes" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
          {sessao && (
            <button type="button" className="av-btn av-btn-primario" onClick={() => navegar(destinoPosLogin(sessao.papel, null))}>
              Ir para a minha área
            </button>
          )}
          <button type="button" className="av-btn av-btn-contorno" onClick={() => navegar('/aulas')}>
            Ver as aulas
          </button>
        </div>
      </section>
    </div>
  );
}
