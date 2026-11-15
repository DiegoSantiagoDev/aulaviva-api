import { ShieldCheck, Lock, Eye, Trash2, Users, type LucideIcon } from 'lucide-react';
import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

interface Ponto {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const pontos: Ponto[] = [
  { icone: ShieldCheck, titulo: 'Autorização e transparência', descricao: 'A implantação depende de autorização da instituição e dos responsáveis, com comunicação clara a professores e estudantes.' },
  { icone: Lock, titulo: 'Conformidade com a LGPD', descricao: 'Observância da legislação de proteção de dados, com atenção especial a dados de crianças e adolescentes.' },
  { icone: Eye, titulo: 'Acesso controlado por função', descricao: 'Quem pode gravar, enviar, consultar, corrigir e excluir conteúdos é definido por usuário e papel.' },
  { icone: Trash2, titulo: 'Retenção e remoção', descricao: 'Prazos de manutenção dos arquivos e tratamento de pedidos de acesso ou remoção são definidos claramente.' },
  { icone: Users, titulo: 'Validação humana', descricao: 'A IA é apresentada como apoio. Resumos e slides passam por conferência antes do uso oficial.' },
];

function Linha({ ponto, indice }: { ponto: Ponto; indice: number }) {
  const { ref, inView } = useReveal<HTMLLIElement>(0.3);
  const Icone = ponto.icone;
  return (
    <li
      ref={ref}
      className={`av-inst-priv-linha reveal ${inView ? 'in-view' : ''}`}
      style={{ transitionDelay: `${indice * 80}ms` }}
    >
      <span className="av-inst-priv-icone">
        <Icone aria-hidden="true" />
      </span>
      <div>
        <h3 className="av-inst-priv-titulo">{ponto.titulo}</h3>
        <p className="av-inst-priv-texto">{ponto.descricao}</p>
      </div>
    </li>
  );
}

export default function Privacy() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section className="av-inst-secao av-inst-priv paper-grain" aria-labelledby="privacidade-titulo">
      <div className="av-inst-secao-in av-inst-priv-grade">
        <div ref={ref} className={`av-inst-priv-intro reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="privacidade-titulo" className="av-inst-secao-titulo">
            Dados tratados com responsabilidade
          </h2>
          <p className="av-inst-priv-lead">
            Gravações e imagens de um ambiente escolar exigem cuidado especial. O AulaViva segue a LGPD e
            princípios de transparência.
          </p>

          <div className="av-inst-priv-situacao">
            <h3 className="av-inst-priv-situacao-titulo">Situação atual</h3>
            <p className="av-inst-priv-situacao-texto">
              O backend Spring Boot e a interface com IA processam os áudios e geram resumos e slides. A captura
              de áudio via placa embarcada e integração por QR code são etapas de expansão futura.
            </p>
          </div>
        </div>

        <ul className="av-inst-priv-lista">
          {pontos.map((p, i) => (
            <Linha key={p.titulo} ponto={p} indice={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
