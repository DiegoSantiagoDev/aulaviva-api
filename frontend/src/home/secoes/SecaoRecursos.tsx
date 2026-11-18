import LinhaMascara from './LinhaMascara.tsx';

const RECURSOS = [
  {
    n: '01',
    titulo: 'Resumo organizado',
    texto: 'A explicação vira um texto em tópicos, com índice de navegação e leitura confortável em qualquer tela.',
  },
  {
    n: '02',
    titulo: 'Slides navegáveis',
    texto: 'Cada aula ganha uma apresentação com setas, miniaturas, tela cheia e impressão em PDF.',
  },
  {
    n: '03',
    titulo: 'Fotos do quadro',
    texto: 'O professor anexa até três fotos por aula, e o aluno amplia cada uma na galeria.',
  },
  {
    n: '04',
    titulo: 'Processamento acompanhado',
    texto: 'Criada, processando, pronta ou com falha: o painel mostra o estado real e permite reprocessar.',
  },
] as const;

export default function SecaoRecursos() {
  return (
    <section className="inicio-recursos" aria-labelledby="titulo-recursos">
      <div className="ini-marquee" aria-hidden="true">
        <div className="ini-marquee-faixa marq-a">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>Áudio — Resumo — Slides — Quadro — </span>
          ))}
        </div>
        <div className="ini-marquee-faixa ini-marquee-cheia marq-b">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>Aprender — Descobrir — Evoluir — </span>
          ))}
        </div>
      </div>

      <header className="recursos-cabeca">
        <p className="ini-rotulo rev">O que acontece depois da aula</p>
        <h2 id="titulo-recursos" className="ini-titulo ini-titulo-grande">
          <LinhaMascara classe="rev-linha">Tudo o que a gravação</LinhaMascara>
          <LinhaMascara classe="rev-linha">
            <em>pode</em> virar.
          </LinhaMascara>
        </h2>
      </header>

      <ul className="recursos-lista">
        {RECURSOS.map((r) => (
          <li key={r.n} className="recurso rev">
            <span className="recurso-n">{r.n}</span>
            <h3 className="recurso-titulo">{r.titulo}</h3>
            <p className="recurso-texto">{r.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
