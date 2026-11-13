import React from 'react';
import { useRoteador } from './Roteador';
import { GraduationCap, BookOpen, Home, Sparkles } from 'lucide-react';

interface LayoutAppProps {
  children: React.ReactNode;
}

export default function LayoutApp({ children }: LayoutAppProps) {
  const { rota, navegar } = useRoteador();
  const eProfessor = rota.startsWith('/professor');
  const eAluno = rota.startsWith('/aulas');

  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col paper-grain selection:bg-gold/30">
      {/* Cabeçalho enxuto da aplicação interna */}
      <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur-md border-b border-gold/25 transition-all no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logotipo */}
          <button
            onClick={() => navegar('/')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
            aria-label="AulaViva - Voltar à página inicial"
          >
            <span className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-gold transition-transform duration-300 group-hover:scale-110 shadow-sm">
              <Sparkles className="w-4 h-4 text-gold anim-breathe" />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
                AulaViva
                <span className="text-[10px] tracking-widest font-sans uppercase px-1.5 py-0.5 rounded bg-gold/20 text-ink-soft">
                  App
                </span>
              </span>
            </div>
          </button>

          {/* Troca rápida de perfil & Início */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center p-1 rounded-full bg-ink/5 border border-gold/20" aria-label="Perfil do usuário">
              <button
                onClick={() => navegar('/aulas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  eAluno
                    ? 'bg-ink text-parchment shadow-sm'
                    : 'text-ink-soft hover:text-ink hover:bg-gold/10'
                }`}
                aria-current={eAluno ? 'page' : undefined}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Aluno</span>
              </button>

              <button
                onClick={() => navegar('/professor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  eProfessor
                    ? 'bg-ink text-parchment shadow-sm'
                    : 'text-ink-soft hover:text-ink hover:bg-gold/10'
                }`}
                aria-current={eProfessor ? 'page' : undefined}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Professor</span>
              </button>
            </nav>

            <button
              onClick={() => navegar('/')}
              className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-gold/10 transition-colors"
              title="Voltar à apresentação"
              aria-label="Página de apresentação"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Rodapé discreto */}
      <footer className="border-t border-gold/20 py-6 text-center text-xs text-ink-soft/70">
        <p>AulaViva — Aulas que ganham vida com inteligência artificial.</p>
      </footer>
    </div>
  );
}
