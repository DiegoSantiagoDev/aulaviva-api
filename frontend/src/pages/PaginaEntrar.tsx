import { useRoteador } from '../app/Roteador';
import { BookOpen, GraduationCap, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import EmblemaEntrada from '../components/EmblemaEntrada';
import './entrar.css';

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
    <div className="av-entrar paper-grain">
      {/* Botão de retorno à apresentação */}
      <div className="av-entrar-topo">
        <button onClick={() => navegar('/')} className="av-voltar">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar à apresentação</span>
        </button>

        <div className="av-marca">
          <span className="av-marca-ponto anim-breathe" aria-hidden="true" />
          AulaViva
        </div>
      </div>

      {/* Conteúdo central */}
      <main className="av-entrar-miolo">
        {/* Cabeçalho */}
        <div className="av-entrar-cab anim-fade-up">
          <EmblemaEntrada inView={true} className="av-entrar-emblema" />
          <h1 className="av-titulo">Como você deseja acessar hoje?</h1>
          <p className="av-lead">
            Escolha seu perfil para continuar. Esta demonstração não requer cadastro nem senha.
          </p>
        </div>

        {/* Grade com os 2 perfis */}
        <div className="av-perfis">
          {/* Card Aluno */}
          <div
            onClick={() => selecionarPerfil('aluno')}
            className="av-perfil"
            data-tom="ouro"
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
              <div className="av-perfil-icone">
                <BookOpen className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="av-perfil-titulo">Sou aluno</h2>
              <p className="av-perfil-texto">
                Acesse a biblioteca de aulas com resumos didáticos organizados, apresentações de slides dinâmicas, fotos do quadro e o guia de estudo em vídeo.
              </p>
            </div>

            <div className="av-perfil-rodape">
              <span>Acessar biblioteca</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Card Professor */}
          <div
            onClick={() => selecionarPerfil('professor')}
            className="av-perfil"
            data-tom="salvia"
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
              <div className="av-perfil-icone">
                <GraduationCap className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="av-perfil-titulo">Sou professor</h2>
              <p className="av-perfil-texto">
                Cadastre novas aulas, envie gravações de áudio e fotografias do quadro, acompanhe o processamento de IA e gerencie as publicações.
              </p>
            </div>

            <div>
              {/* Aviso importante de ausência de login */}
              <div className="av-aviso" role="note">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                <span>Esta versão não tem login. Use apenas em rede de confiança.</span>
              </div>

              <div className="av-perfil-rodape">
                <span>Painel docente</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé informativo */}
      <div className="av-entrar-rodape">
        AulaViva: sistema experimental para recuperação e síntese didática de aulas
      </div>
    </div>
  );
}
