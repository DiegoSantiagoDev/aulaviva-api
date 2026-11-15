import {
  Cpu,
  Mic,
  Wifi,
  Smartphone,
  Server,
  Database,
  BrainCircuit,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

interface Tecnologia {
  icone: LucideIcon;
  nome: string;
  uso: string;
}

interface Grupo {
  id: string;
  titulo: string;
  tom: 'ouro' | 'salvia';
  itens: Tecnologia[];
}

const grupos: Grupo[] = [
  {
    id: 'hardware',
    titulo: 'Hardware',
    tom: 'ouro',
    itens: [
      { icone: Cpu, nome: 'ESP32 DevKit V1', uso: 'Controle da captura e comunicação do áudio' },
      { icone: Mic, nome: 'INMP441', uso: 'Captação digital de áudio por I2S' },
      { icone: Wifi, nome: 'Wi-Fi Local', uso: 'Comunicação direta em rede local com o servidor' },
      { icone: Smartphone, nome: 'Celular do professor', uso: 'Captura e compressão de imagens no navegador' },
    ],
  },
  {
    id: 'software',
    titulo: 'Software e IA',
    tom: 'salvia',
    itens: [
      { icone: Server, nome: 'Java + Spring Boot', uso: 'Backend robusto, API REST e pipelines de IA' },
      { icone: Database, nome: 'PostgreSQL', uso: 'Persistência de dados das aulas e metadados' },
      { icone: BrainCircuit, nome: 'Whisper + Qwen (Groq)', uso: 'Transcrição e síntese didática estruturada' },
      { icone: MonitorSmartphone, nome: 'React 18 + Tailwind', uso: 'Interface acessível, responsiva e offline' },
    ],
  },
];

function Cartao({ item, indice }: { item: Tecnologia; indice: number }) {
  const { ref, inView } = useReveal<HTMLLIElement>(0.3);
  const Icone = item.icone;
  return (
    <li
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''}`}
      style={{ transitionDelay: `${indice * 70}ms` }}
    >
      <div className="av-inst-tec">
        <span className="av-inst-tec-icone">
          <Icone aria-hidden="true" />
        </span>
        <h4 className="av-inst-tec-nome">{item.nome}</h4>
        <p className="av-inst-tec-uso">{item.uso}</p>
      </div>
    </li>
  );
}

export default function TechStack() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section id="tecnologia" className="av-inst-secao paper-grain" aria-labelledby="tecnologia-titulo">
      <div className="av-inst-secao-in">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="tecnologia-titulo" className="av-inst-secao-titulo">
            Hardware, software e IA
          </h2>
          <p className="av-inst-secao-lead">
            Tecnologias previstas para o projeto. Do microfone na sala de aula ao modelo de IA no servidor, cada
            peça tem um papel.
          </p>
          <div className="av-inst-secao-fio" />
        </div>

        <div className="av-inst-tec-grupos">
          {grupos.map((grupo, g) => (
            <div key={grupo.id} className="av-inst-tec-grupo" data-tom={grupo.tom}>
              <h3 className="av-inst-tec-grupo-titulo" id={`tec-${grupo.id}`}>
                {grupo.titulo}
              </h3>
              <ul className="av-inst-tec-lista" aria-labelledby={`tec-${grupo.id}`}>
                {grupo.itens.map((item, i) => (
                  <Cartao key={item.nome} item={item} indice={g * 2 + i} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
