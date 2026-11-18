import { ArrowRight } from 'lucide-react';
import BotaoMagnetico from '../../components/ui/BotaoMagnetico.tsx';
import LinhaMascara from './LinhaMascara.tsx';

interface Props {
  irPara: (rota: string) => void;
}

export default function SecaoHero({ irPara }: Props) {
  return (
    <section className="inicio-hero" aria-labelledby="titulo-hero">
      <div className="hero-conteudo">
        <p className="ini-rotulo h-fade">A sala de aula, sem perder nada</p>
        <h1 id="titulo-hero" className="ini-monumental">
          <LinhaMascara classe="h-linha">A aula</LinhaMascara>
          <LinhaMascara classe="h-linha">acaba.</LinhaMascara>
          <LinhaMascara classe="h-linha">O saber</LinhaMascara>
          <LinhaMascara classe="h-linha">
            <span className="ini-brasa">fica aceso.</span>
          </LinhaMascara>
        </h1>
        <p className="ini-lead h-fade">
          Grave a explicação. O Aula Viva transforma a voz do professor em resumo, slides e material de estudo —
          pronto na biblioteca para quem quer aprender.
        </p>
        <div className="ini-acoes h-fade">
          <BotaoMagnetico className="ini-botao ini-botao-brasa" onClick={() => irPara('/aulas')}>
            <span>Abrir a biblioteca</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </BotaoMagnetico>
          <BotaoMagnetico className="ini-botao ini-botao-vidro" onClick={() => irPara('/cadastro')}>
            <span>Sou professor</span>
          </BotaoMagnetico>
        </div>
      </div>

      <div className="hero-rodape h-fade" aria-hidden="true">
        <span className="ini-rotulo">Áudio → Resumo → Slides</span>
        <span className="hero-rolar">
          <span className="hero-rolar-ponto" />
          <span className="ini-rotulo">Role</span>
        </span>
        <span className="ini-rotulo">01 / 05</span>
      </div>
    </section>
  );
}
