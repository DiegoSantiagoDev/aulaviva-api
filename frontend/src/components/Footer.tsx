import { useRoteador } from '../app/Roteador';
import './institucional.css';

const linksExplorar = [
  { rotulo: 'Como funciona', id: 'funcionamento' },
  { rotulo: 'Inteligência artificial', id: 'ia' },
  { rotulo: 'Plataforma do aluno', id: 'plataforma' },
  { rotulo: 'Tecnologia', id: 'tecnologia' },
  { rotulo: 'Etapas previstas', id: 'etapas' },
];

const linksAcesso = [
  { rotulo: 'Biblioteca do aluno', rota: '/aulas' },
  { rotulo: 'Painel do professor', rota: '/professor' },
  { rotulo: 'Porta de entrada', rota: '/entrar' },
];

export default function Footer() {
  const { navegar } = useRoteador();

  // Não usamos <a href="#...">: no roteador por hash isso trocaria a rota.
  const rolarPara = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="av-inst-rodape">
      <div className="av-inst-rodape-in">
        <div>
          <p className="av-inst-rodape-marca">
            <span className="av-inst-rodape-ponto anim-breathe" aria-hidden="true" />
            AulaViva
          </p>
          <p className="av-inst-rodape-lema">Nenhuma aula precisa ser perdida.</p>
          <p className="av-inst-rodape-texto">
            Plataforma educacional para recuperação de conteúdo escolar com resumos didáticos, apresentações de
            slides dinâmicas e roteiros para vídeos explicativos no Google NotebookLM.
          </p>
          <button type="button" onClick={() => navegar('/entrar')} className="av-btn av-btn-ouro">
            Entrar no AulaViva
          </button>
        </div>

        <nav aria-labelledby="rodape-explorar">
          <h3 id="rodape-explorar" className="av-inst-rodape-titulo">
            Explorar
          </h3>
          <ul className="av-inst-rodape-lista">
            {linksExplorar.map((l) => (
              <li key={l.id}>
                <button type="button" className="av-inst-rodape-link" onClick={() => rolarPara(l.id)}>
                  {l.rotulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="rodape-acesso">
          <h3 id="rodape-acesso" className="av-inst-rodape-titulo">
            Acesso rápido
          </h3>
          <ul className="av-inst-rodape-lista">
            {linksAcesso.map((l) => (
              <li key={l.rota}>
                <button type="button" className="av-inst-rodape-link" onClick={() => navegar(l.rota)}>
                  {l.rotulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="av-inst-rodape-base">
        <p>&copy; 2026 AulaViva. Todos os direitos reservados. Recuperação e síntese didática com inteligência artificial.</p>
        <ul className="av-inst-rodape-fases">
          <li>Captura</li>
          <li>Processamento</li>
          <li>Aprendizagem</li>
        </ul>
      </div>
    </footer>
  );
}
