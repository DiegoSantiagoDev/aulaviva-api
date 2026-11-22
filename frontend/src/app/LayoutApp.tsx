import type { ReactNode } from 'react';
import { BookOpen, GraduationCap, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useRoteador } from './Roteador.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import UniversoEstelar from '../components/ui/UniversoEstelar.tsx';
import './layout.css';

const ROTULO_PAPEL = { ADMIN: 'Administrador', PROFESSOR: 'Professor', ALUNO: 'Aluno' } as const;

/**
 * Moldura das áreas de uso. O menu mostra só o que o papel da sessão pode abrir;
 * visitante anônimo (aluno) vê as aulas e o botão de entrar.
 */
export default function LayoutApp({ children }: { children: ReactNode }) {
  const { rota, navegar } = useRoteador();
  const { sessao, sair } = useAuth();

  const itens = [
    { rota: '/aulas', rotulo: 'Aulas', Icone: BookOpen, visivel: true },
    { rota: '/professor', rotulo: 'Painel', Icone: GraduationCap, visivel: sessao?.papel === 'PROFESSOR' || sessao?.papel === 'ADMIN' },
    { rota: '/admin', rotulo: 'Administração', Icone: ShieldCheck, visivel: sessao?.papel === 'ADMIN' },
  ].filter((i) => i.visivel);

  const sairDaConta = () => {
    sair();
    navegar('/');
  };

  return (
    <div className="av-app">
      <UniversoEstelar variante="app" />
      <a href="#conteudo" className="av-pular" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>
        Pular para o conteúdo
      </a>
      <header className="av-cabeca no-print">
        <div className="av-cabeca-in">
          <button type="button" className="av-marca" onClick={() => navegar('/')} aria-label="Aula Viva — página inicial">
            <span className="av-marca-nucleo" aria-hidden="true" />
            <span className="av-marca-nome">Aula Viva</span>
          </button>

          <nav className="av-menu" aria-label="Áreas do app">
            {itens.map(({ rota: destino, rotulo, Icone }) => {
              const ativo = rota === destino || rota.startsWith(`${destino}/`);
              return (
                <button key={destino} type="button" className="av-menu-item" aria-current={ativo ? 'page' : undefined} onClick={() => navegar(destino)}>
                  <Icone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{rotulo}</span>
                </button>
              );
            })}
          </nav>

          <div className="av-sessao">
            {sessao ? (
              <>
                <div className="av-sessao-quem">
                  <span className="av-sessao-nome">{sessao.nome}</span>
                  <span className="av-rotulo">{ROTULO_PAPEL[sessao.papel]}</span>
                </div>
                <button type="button" className="av-btn av-btn-suave" onClick={sairDaConta}>
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <button type="button" className="av-btn av-btn-contorno" onClick={() => navegar('/entrar')}>
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="av-principal outline-none">
        {children}
      </main>

      <footer className="av-rodape-app no-print">
        <p>Aula Viva — o conhecimento acende.</p>
      </footer>
    </div>
  );
}
