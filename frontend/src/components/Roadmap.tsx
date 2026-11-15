import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

interface Marco {
  rotulo: string;
  descricao: string;
}

const marcos: Marco[] = [
  { rotulo: 'API inicial com Spring Boot', descricao: 'Estruturação dos serviços de aula, status e armazenamento.' },
  { rotulo: 'Recebimento de áudio (PC)', descricao: 'Envio de gravações com progresso real e validações de cliente.' },
  { rotulo: 'Comunicação Wi-Fi', descricao: 'Conexão entre dispositivos locais e o servidor da rede.' },
  { rotulo: 'Integrar INMP441', descricao: 'Captura acústica e transmissão em blocos (fase futura).' },
  { rotulo: 'Envio de imagens', descricao: 'Professor fotografa o quadro com compressão inteligente no navegador.' },
  { rotulo: 'Organização dos dados', descricao: 'Estruturação por disciplina, data e agrupamento alfabético.' },
  { rotulo: 'Integração da IA', descricao: 'Transcrição via Whisper e geração de resumos e slides via Qwen (exercícios em breve).' },
  { rotulo: 'Plataforma de acesso', descricao: 'Interface única para alunos e professores com design clássico e acessível.' },
  { rotulo: 'Testes em ambiente real', descricao: 'Validação do fluxo durante apresentações e feiras escolares.' },
];

function MarcoItem({ marco, indice }: { marco: Marco; indice: number }) {
  const { ref, inView } = useReveal<HTMLLIElement>(0.3);
  return (
    <li ref={ref} className={`av-inst-marco reveal ${inView ? 'in-view' : ''}`}>
      {/* A ordem das etapas é real: o número marca a sequência */}
      <span className="av-inst-marco-no" aria-hidden="true">
        {indice + 1}
      </span>
      <div className="av-inst-marco-card">
        <h3 className="av-inst-marco-titulo">
          <span className="sr-only">Etapa {indice + 1}: </span>
          {marco.rotulo}
        </h3>
        <p className="av-inst-marco-texto">{marco.descricao}</p>
      </div>
    </li>
  );
}

export default function Roadmap() {
  const { ref, inView } = useReveal(0.1);
  return (
    <section id="etapas" className="av-inst-secao paper-grain" aria-labelledby="etapas-titulo">
      <div className="av-inst-secao-in av-inst-secao-in-estreita">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="etapas-titulo" className="av-inst-secao-titulo">
            O caminho do projeto
          </h2>
          <p className="av-inst-secao-lead">
            Etapas previstas: nove passos planejados, do backend inicial aos testes em aulas reais.
          </p>
          <div className="av-inst-secao-fio" />
        </div>

        <ol className="av-inst-marcos">
          {marcos.map((m, i) => (
            <MarcoItem key={m.rotulo} marco={m} indice={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
