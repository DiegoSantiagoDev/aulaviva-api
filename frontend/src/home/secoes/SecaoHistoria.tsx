import LinhaMascara from './LinhaMascara.tsx';

const ONDA = Array.from({ length: 34 }, (_, i) => i);

/**
 * Seção fixada (pin) de três cenas. O scroll controla o texto, os numerais
 * gigantes e, via estadoCena, a câmera e a luz do núcleo 3D.
 */
export default function SecaoHistoria() {
  return (
    <section className="inicio-historia" aria-label="Como uma aula ganha vida">
      <div className="hist-numeros" aria-hidden="true">
        <span>01</span>
        <span>02</span>
        <span>03</span>
      </div>

      <div className="hist-trilho" aria-hidden="true">
        <span className="hist-fio">
          <span className="hist-fio-preenche" />
        </span>
        <span className="hist-passo" data-passo="0">Captura</span>
        <span className="hist-passo" data-passo="1">Destilação</span>
        <span className="hist-passo" data-passo="2">Luz</span>
      </div>

      <article className="hist-cena hist-cena-1">
        <div className="hist-bloco">
          <p className="ini-rotulo">01 — Captura</p>
          <h2 className="ini-titulo">
            <LinhaMascara classe="hist-linha">Uma voz</LinhaMascara>
            <LinhaMascara classe="hist-linha">
              entra na <em>sala</em>.
            </LinhaMascara>
          </h2>
          <p className="ini-texto">
            O professor grava a aula e envia o áudio. Só isso: sem digitar, sem montar, sem esperar na frente do computador.
          </p>
          <div className="hist-onda" aria-hidden="true">
            {ONDA.map((i) => (
              <span key={i} style={{ ['--i' as string]: i }} />
            ))}
          </div>
        </div>
      </article>

      <article className="hist-cena hist-cena-2">
        <div className="hist-bloco hist-bloco-direita">
          <p className="ini-rotulo">02 — Destilação</p>
          <h2 className="ini-titulo">
            <LinhaMascara classe="hist-linha">A voz vira</LinhaMascara>
            <LinhaMascara classe="hist-linha">
              <em>estrutura</em>.
            </LinhaMascara>
          </h2>
          <p className="ini-texto hist-fade">
            O áudio é transcrito e a inteligência artificial organiza o que foi dito em resumo e slides. O professor
            acompanha cada etapa, e o status vem do servidor — nada é inventado na tela.
          </p>
          <ul className="hist-estados hist-fade" aria-label="Etapas do processamento">
            <li>Criada</li>
            <li data-vivo>Processando</li>
            <li>Pronta</li>
          </ul>
        </div>
      </article>

      <article className="hist-cena hist-cena-3">
        <div className="hist-bloco">
          <p className="ini-rotulo">03 — Luz</p>
          <h2 className="ini-titulo">
            <LinhaMascara classe="hist-linha">O quadro entra</LinhaMascara>
            <LinhaMascara classe="hist-linha">
              na <em>história</em>.
            </LinhaMascara>
          </h2>
          <p className="ini-texto hist-fade">
            Até três fotos do quadro acompanham cada aula. Quando tudo está pronto, a aula acende para a turma — e só
            então aparece para os alunos.
          </p>
          <div className="hist-quadros hist-fade" aria-hidden="true">
            <span>Foto 1</span>
            <span>Foto 2</span>
            <span>Foto 3</span>
          </div>
        </div>
      </article>
    </section>
  );
}
