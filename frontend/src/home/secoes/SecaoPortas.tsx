import { ArrowUpRight } from 'lucide-react';
import LinhaMascara from './LinhaMascara.tsx';

interface Props {
  irPara: (rota: string) => void;
}

export default function SecaoPortas({ irPara }: Props) {
  return (
    <section className="inicio-portas" aria-labelledby="titulo-portas">
      <header className="portas-cabeca">
        <p className="ini-rotulo rev">Duas portas</p>
        <h2 id="titulo-portas" className="ini-titulo ini-titulo-grande">
          <LinhaMascara classe="rev-linha">Quem aprende</LinhaMascara>
          <LinhaMascara classe="rev-linha">
            e quem <em>ensina</em>.
          </LinhaMascara>
        </h2>
      </header>

      <div className="portas-grade">
        <article className="porta porta-aluno rev-clip">
          <span className="porta-letra" aria-hidden="true">A</span>
          <p className="ini-rotulo">Para o aluno</p>
          <h3 className="porta-titulo">Estude sem criar conta.</h3>
          <p className="ini-texto">
            A página de aulas é pública e mostra somente aulas que já ficaram prontas: resumo, slides e fotos do quadro, no
            seu ritmo.
          </p>
          <button type="button" className="porta-acao" onClick={() => irPara('/aulas')}>
            <span>Ver as aulas</span>
            <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </article>

        <article className="porta porta-professor rev-clip">
          <span className="porta-letra" aria-hidden="true">P</span>
          <p className="ini-rotulo">Para o professor</p>
          <h3 className="porta-titulo">Envie a aula. A administração libera o acesso.</h3>
          <ol className="porta-passos">
            <li>Cadastre-se como professor</li>
            <li>Aguarde a aprovação do administrador</li>
            <li>Entre no painel e envie o áudio</li>
          </ol>
          <div className="ini-acoes">
            <button type="button" className="porta-acao" onClick={() => irPara('/cadastro')}>
              <span>Cadastrar-me</span>
              <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" className="porta-acao porta-acao-sutil" onClick={() => irPara('/entrar')}>
              <span>Já tenho conta</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
