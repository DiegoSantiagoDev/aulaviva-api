import type { ComponentType } from 'react';
import { Camera, Cpu, MonitorPlay, type LucideIcon } from 'lucide-react';
import EmblemaCaptura from './EmblemaCaptura';
import EmblemaProcessamento from './EmblemaProcessamento';
import EmblemaEstudo from './EmblemaEstudo';
import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

interface EmblemaProps {
  className?: string;
  inView?: boolean;
}

interface EtapaDados {
  icone: LucideIcon;
  titulo: string;
  momento: string;
  descricao: string;
  Emblema: ComponentType<EmblemaProps>;
  tom: 'terra' | 'ouro' | 'salvia';
}

const etapas: EtapaDados[] = [
  {
    icone: Camera,
    titulo: 'Captura',
    momento: 'Durante a aula',
    descricao:
      'O áudio da aula é captado e o professor fotografa o quadro e os esquemas explicativos pelo celular, enviando diretamente à plataforma com compressão inteligente.',
    Emblema: EmblemaCaptura,
    tom: 'terra',
  },
  {
    icone: Cpu,
    titulo: 'Processamento',
    momento: 'No servidor',
    descricao:
      'O backend em Spring Boot recebe os arquivos e aciona os modelos de IA: transcrição da fala (Whisper) e geração em chamada única de resumos didáticos e apresentações de slides (Qwen via Groq).',
    Emblema: EmblemaProcessamento,
    tom: 'ouro',
  },
  {
    icone: MonitorPlay,
    titulo: 'Plataforma',
    momento: 'Para os estudantes',
    descricao:
      'Cada aula vira um conjunto didático completo: resumo estruturado em tópicos, slides com design editorial, galeria de fotos do quadro e guia passo a passo para gerar vídeo no Google NotebookLM.',
    Emblema: EmblemaEstudo,
    tom: 'salvia',
  },
];

function Etapa({ etapa, indice, ultima }: { etapa: EtapaDados; indice: number; ultima: boolean }) {
  const { ref, inView } = useReveal<HTMLLIElement>(0.25);
  const { icone: Icone, Emblema } = etapa;

  return (
    <li ref={ref} className={`reveal ${inView ? 'in-view' : ''}`} data-tom={etapa.tom}>
      <div className="av-inst-etapa">
        <div className="av-inst-etapa-topo">
          <span className="av-inst-etapa-icone">
            <Icone aria-hidden="true" />
          </span>
          {/* A ordem das etapas é real: o número marca a sequência */}
          <span className="av-inst-etapa-num" aria-hidden="true">{indice + 1}</span>
        </div>
        <h3 className="av-inst-etapa-titulo">
          <span className="sr-only">Etapa {indice + 1}: </span>
          {etapa.titulo}
        </h3>
        <p className="av-inst-etapa-momento">{etapa.momento}</p>
        <p className="av-inst-etapa-texto">{etapa.descricao}</p>
        <div className="av-inst-etapa-selo">
          <Emblema inView={inView} className="av-inst-etapa-emblema" />
        </div>
      </div>
      {!ultima && <span className="av-inst-etapa-liga anim-breathe" aria-hidden="true" />}
    </li>
  );
}

export default function HowItWorks() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section id="funcionamento" className="av-inst-secao paper-grain" aria-labelledby="funcionamento-titulo">
      <div className="av-inst-secao-in">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="funcionamento-titulo" className="av-inst-secao-titulo">
            Da sala de aula à tela
          </h2>
          <p className="av-inst-secao-lead">
            Em três etapas simples, o conteúdo vivo da aula é transformado em materiais de estudo
            estruturados que ficam disponíveis para consulta quando e onde o estudante precisar.
          </p>
          <div className="av-inst-secao-fio" />
        </div>
        <ol className="av-inst-etapas">
          {etapas.map((etapa, i) => (
            <Etapa key={etapa.titulo} etapa={etapa} indice={i} ultima={i === etapas.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
