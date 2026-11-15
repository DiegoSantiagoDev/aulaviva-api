import { Camera, CheckCircle2, Clock, Upload, type LucideIcon } from 'lucide-react';
import EmblemaIndicadores from './EmblemaIndicadores';
import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

interface Passo {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const passos: Passo[] = [
  {
    icone: Camera,
    titulo: 'Fotografe o quadro',
    descricao: 'Quadro, slides, exercícios, diagramas — tudo o que foi usado na explicação.',
  },
  {
    icone: Upload,
    titulo: 'Envie à plataforma',
    descricao: 'Associe as imagens à turma, disciplina e aula correspondente em poucos toques.',
  },
  {
    icone: CheckCircle2,
    titulo: 'Revise os materiais',
    descricao: 'Veja os resumos e slides gerados pela IA. Aprove, ajuste ou reprocesse antes de publicar.',
  },
];

type StatusRevisao = 'Aprovado' | 'Revisar';

const itensRevisao: { tipo: string; status: StatusRevisao; texto: string }[] = [
  { tipo: 'Resumo', status: 'Aprovado', texto: 'Resumo: Equação do 2º grau' },
  { tipo: 'Slides', status: 'Aprovado', texto: 'Apresentação com 8 slides didáticos' },
  { tipo: 'Vídeo', status: 'Revisar', texto: 'Guia do NotebookLM para os alunos' },
];

const pendentes = itensRevisao.filter((i) => i.status === 'Revisar').length;

function PassoItem({ passo, indice, ultimo }: { passo: Passo; indice: number; ultimo: boolean }) {
  const { ref, inView } = useReveal<HTMLLIElement>(0.3);
  const Icone = passo.icone;
  return (
    <li
      ref={ref}
      className={`av-inst-passo reveal ${inView ? 'in-view' : ''}`}
      style={{ transitionDelay: `${indice * 120}ms` }}
    >
      <div className="av-inst-passo-trilho">
        <span className="av-inst-passo-icone">
          <Icone aria-hidden="true" />
        </span>
        {!ultimo && <span className="av-inst-passo-linha" aria-hidden="true" />}
      </div>
      <div className="av-inst-passo-corpo">
        <h3 className="av-inst-passo-titulo">
          <span className="sr-only">Passo {indice + 1}: </span>
          {passo.titulo}
        </h3>
        <p className="av-inst-passo-texto">{passo.descricao}</p>
      </div>
    </li>
  );
}

export default function TeacherArea() {
  const { ref, inView } = useReveal(0.15);
  const nota = useReveal(0.3);

  return (
    <section className="av-inst-professor" aria-labelledby="professor-titulo">
      <span className="av-inst-professor-anel av-inst-professor-anel-a anim-rotate-slow" aria-hidden="true" />
      <span className="av-inst-professor-anel av-inst-professor-anel-b anim-rotate-slow" aria-hidden="true" />

      <div className="av-inst-professor-in">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="professor-titulo" className="av-inst-fluxo-titulo">
            O professor no <span className="av-inst-brilho-noite">centro</span>
          </h2>
          <p className="av-inst-fluxo-lead">
            Os professores enviam áudios e imagens, acompanham os conteúdos e revisam os materiais produzidos pela
            IA antes que cheguem aos estudantes.
          </p>
        </div>

        <div className="av-inst-professor-grade">
          <ol className="av-inst-passos">
            {passos.map((p, i) => (
              <PassoItem key={p.titulo} passo={p} indice={i} ultimo={i === passos.length - 1} />
            ))}
          </ol>

          <div className={`av-inst-revisao reveal ${inView ? 'in-view' : ''}`}>
            <div className="av-inst-revisao-topo">
              <h3 className="av-inst-revisao-titulo">Revisão de materiais</h3>
              <span className="av-inst-revisao-pendentes">
                <Clock aria-hidden="true" />
                Pendentes: {pendentes}
              </span>
            </div>
            <ul className="av-inst-revisao-lista">
              {itensRevisao.map((item, i) => (
                <li
                  key={item.texto}
                  className="av-inst-revisao-item"
                  style={{ ['--atraso' as string]: `${i * 0.15}s` }}
                >
                  <span className="av-inst-revisao-tipo">{item.tipo}</span>
                  <span className="av-inst-revisao-texto">{item.texto}</span>
                  <span className="av-inst-revisao-status" data-status={item.status}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
            <a href="#/professor" className="av-btn av-btn-lg av-btn-ouro av-inst-revisao-acesso">
              Acessar painel do professor
            </a>
          </div>
        </div>

        <div ref={nota.ref} className="av-inst-professor-nota">
          <EmblemaIndicadores inView={nota.inView} className="av-inst-professor-emblema" />
          <p>
            No futuro, indicadores agregados podem mostrar quais assuntos apresentam maior dificuldade para a
            turma, sempre com cuidado pedagógico e respeito à privacidade.
          </p>
        </div>
      </div>
    </section>
  );
}
