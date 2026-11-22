import { ArrowRight } from 'lucide-react';
import BotaoMagnetico from '../../components/ui/BotaoMagnetico.tsx';
import LinhaMascara from './LinhaMascara.tsx';

interface Props {
  irPara: (rota: string) => void;
}

export default function SecaoFim({ irPara }: Props) {
  return (
    <section className="inicio-fim" aria-labelledby="titulo-fim">
      <div className="fim-conteudo">
        <h2 id="titulo-fim" className="ini-monumental ini-monumental-medio">
          <LinhaMascara classe="rev-linha">Acenda</LinhaMascara>
          <LinhaMascara classe="rev-linha">
            <span className="ini-brasa">a sua aula.</span>
          </LinhaMascara>
        </h2>
        <div className="ini-acoes rev">
          <BotaoMagnetico className="ini-botao ini-botao-brasa" onClick={() => irPara('/aulas')}>
            <span>Ver as aulas</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </BotaoMagnetico>
          <BotaoMagnetico className="ini-botao ini-botao-vidro" onClick={() => irPara('/entrar')}>
            <span>Entrar como professor</span>
          </BotaoMagnetico>
        </div>
      </div>
      <footer className="fim-rodape">
        <span className="ini-rotulo">Aula Viva</span>
        <span className="ini-rotulo">O conhecimento acende</span>
      </footer>
    </section>
  );
}
