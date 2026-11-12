import { useRoteador } from '../app/Roteador';
import { BookOpen, GraduationCap, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import ArtFigure from '../components/ArtFigure';

export default function PaginaEntrar() {
  const { navegar } = useRoteador();

  const selecionarPerfil = (perfil: 'aluno' | 'professor') => {
    try {
      localStorage.setItem('aulaviva_perfil_escolhido', perfil);
    } catch {
      // Falha silenciosa de localStorage
    }

    if (perfil === 'aluno') {
      navegar('/aulas');
    } else {
      navegar('/professor');
    }
  };

  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col justify-between p-6 sm:p-10 paper-grain">
      {/* Botão de retorno à apresentação */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => navegar('/')}
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-terra transition-colors py-2 px-3 rounded-lg hover:bg-gold/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à apresentação</span>
        </button>

        <div className="font-display font-bold text-xl text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold anim-breathe" />
          AulaViva
        </div>
      </div>

      {/* Conteúdo central */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-12 anim-fade-up">
          <div className="w-28 h-28 mx-auto mb-4 relative flex items-center justify-center">
            <ArtFigure
              pose="vitruvian"
              inView={true}
              className="w-28 h-28 text-ink"
            />
          </div>
          <span className="text-xs uppercase tracking-widest2 text-gold font-semibold">
            Porta de Entrada
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-ink">
            Como você deseja acessar hoje?
          </h1>
          <p className="mt-3 text-ink-soft text-base max-w-md mx-auto">
            Escolha seu perfil para continuar. Esta demonstração não requer cadastro nem senha.
          </p>
        </div>

        {/* Grade com os 2 perfis */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Card Aluno */}
          <div
            onClick={() => selecionarPerfil('aluno')}
            className="art-frame rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group border border-gold/30 hover:border-gold relative overflow-hidden"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selecionarPerfil('aluno');
              }
            }}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-ink/5 border border-gold/30 flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-gold transition-colors duration-300 mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="font-display text-3xl font-bold text-ink group-hover:text-terra transition-colors">
                Sou aluno
              </h2>
              <p className="mt-3 text-ink-soft text-sm leading-relaxed">
                Acesse a biblioteca de aulas com resumos didáticos organizados, apresentações de slides dinâmicas, fotos do quadro e o guia de estudo em vídeo.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gold/20 flex items-center justify-between text-sm font-semibold text-ink group-hover:text-terra transition-colors">
              <span>Acessar biblioteca</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card Professor */}
          <div
            onClick={() => selecionarPerfil('professor')}
            className="art-frame rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group border border-gold/30 hover:border-gold relative overflow-hidden"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selecionarPerfil('professor');
              }
            }}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-ink/5 border border-gold/30 flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-gold transition-colors duration-300 mb-6">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="font-display text-3xl font-bold text-ink group-hover:text-terra transition-colors">
                Sou professor
              </h2>
              <p className="mt-3 text-ink-soft text-sm leading-relaxed">
                Cadastre novas aulas, envie gravações de áudio e fotografias do quadro, acompanhe o processamento de IA e gerencie as publicações.
              </p>
            </div>

            <div className="mt-6">
              {/* Aviso importante de ausência de login */}
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-xs text-ink-soft flex items-start gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-terra flex-shrink-0 mt-0.5" />
                <span>Esta versão não tem login. Use apenas em rede de confiança.</span>
              </div>

              <div className="pt-4 border-t border-gold/20 flex items-center justify-between text-sm font-semibold text-ink group-hover:text-terra transition-colors">
                <span>Painel docente</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé informativo */}
      <div className="text-center text-xs text-ink-soft/60 py-4">
        AulaViva &middot; Sistema experimental para recuperação e síntese didática de aulas
      </div>
    </div>
  );
}
