import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Languages, ScanText, Presentation, type LucideIcon } from 'lucide-react';
import { useReveal } from '../hooks/useReveal.ts';
import './institucional.css';

type TipoDemo = 'transcricao' | 'analise' | 'materiais';

interface Aba {
  id: string;
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  demo: TipoDemo;
}

const abas: Aba[] = [
  {
    id: 'transcricao',
    icone: Languages,
    titulo: 'Transcrição acústica (Whisper)',
    descricao:
      'O modelo Whisper Large V3 transcreve a fala da aula no servidor. Trata-se de uma etapa técnica interna: o aluno recebe o conteúdo filtrado e estruturado, nunca a transcrição bruta cheia de ruídos.',
    demo: 'transcricao',
  },
  {
    id: 'analise',
    icone: ScanText,
    titulo: 'Síntese didática estruturada (Qwen)',
    descricao:
      'Em uma única chamada ao modelo Qwen 3.8 27B (via Groq), a IA analisa o áudio e as fotos do quadro, organizando tópicos principais, conceitos fundamentais e perguntas de fixação.',
    demo: 'analise',
  },
  {
    id: 'materiais',
    icone: Presentation,
    titulo: 'Slides e Guia do NotebookLM',
    descricao:
      'A IA gera simultaneamente os slides da aula em layouts visuais CSS adaptativos e o roteiro contextualizado para criação de vídeo explicativo no Google NotebookLM.',
    demo: 'materiais',
  },
];

const textoTranscricao =
  '...e assim vemos que a equação do segundo grau pode ser resolvida pelo método de Bhaskara, onde o delta determina o número de raízes reais...';

const itensAnalise = [
  { tag: 'Conceito', texto: 'Função do 1º grau (Afim)' },
  { tag: 'Fórmula', texto: 'f(x) = ax + b' },
  { tag: 'Propriedade', texto: 'a > 0 (crescente) | a < 0 (decrescente)' },
  { tag: 'Quadro', texto: 'Gráfico e tabela associados' },
];

const listaMateriais = [
  { tipo: 'Resumo', texto: 'Resumo didático estruturado em seções' },
  { tipo: 'Slides', texto: 'Apresentação com 8 layouts visuais em CSS' },
  { tipo: 'Vídeo', texto: 'Prompt e guia passo a passo para o NotebookLM' },
  { tipo: 'Quadro', texto: 'Galeria com fotos do quadro e zoom acessível' },
];

function prefereMovimentoReduzido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* A fala "digitada" só começa quando a seção aparece. Leitores de tela recebem o texto inteiro. */
function DemoTranscricao({ ativo }: { ativo: boolean }) {
  const [digitado, setDigitado] = useState('');

  useEffect(() => {
    if (!ativo) return;
    if (prefereMovimentoReduzido()) {
      setDigitado(textoTranscricao);
      return;
    }
    setDigitado('');
    let i = 0;
    const intervalo = window.setInterval(() => {
      i += 2;
      setDigitado(textoTranscricao.slice(0, i));
      if (i >= textoTranscricao.length) window.clearInterval(intervalo);
    }, 30);
    return () => window.clearInterval(intervalo);
  }, [ativo]);

  const terminou = digitado.length >= textoTranscricao.length;

  return (
    <div className="av-inst-demo">
      <div className="av-inst-demo-topo">
        <span className="av-inst-ondas" aria-hidden="true">
          {[0.5, 0.8, 1, 0.6, 0.9, 0.4].map((h, i) => (
            <span key={i} className="wave-bar" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </span>
        <span className="av-inst-demo-rotulo">Processamento de fala no servidor</span>
      </div>
      <p className="av-inst-demo-fala">
        <span className="sr-only">{textoTranscricao}</span>
        <span aria-hidden="true">{digitado}</span>
        <span className="av-inst-cursor" data-fim={terminou} aria-hidden="true" />
      </p>
      <p className="av-inst-demo-nota">Etapa interna do pipeline. O aluno recebe apenas o resumo didático limpo.</p>
    </div>
  );
}

function DemoAnalise({ ativo }: { ativo: boolean }) {
  return (
    <ul className="av-inst-demo av-inst-demo-lista" data-ativo={ativo}>
      {itensAnalise.map((item, i) => (
        <li key={item.texto} className="av-inst-demo-item" style={{ ['--atraso' as string]: `${i * 0.15}s` }}>
          <span className="av-inst-tag">{item.tag}</span>
          <span className="av-inst-demo-texto">{item.texto}</span>
        </li>
      ))}
    </ul>
  );
}

function DemoMateriais({ ativo }: { ativo: boolean }) {
  return (
    <ul className="av-inst-demo av-inst-demo-lista" data-ativo={ativo}>
      {listaMateriais.map((m, i) => (
        <li key={m.texto} className="av-inst-demo-item" style={{ ['--atraso' as string]: `${i * 0.12}s` }}>
          <span className="av-inst-tag av-inst-tag-escura">{m.tipo}</span>
          <span className="av-inst-demo-texto">{m.texto}</span>
        </li>
      ))}
    </ul>
  );
}

function Demo({ tipo, ativo }: { tipo: TipoDemo; ativo: boolean }) {
  if (tipo === 'transcricao') return <DemoTranscricao ativo={ativo} />;
  if (tipo === 'analise') return <DemoAnalise ativo={ativo} />;
  return <DemoMateriais ativo={ativo} />;
}

export default function AIFeatures() {
  const [indice, setIndice] = useState(0);
  const { ref, inView } = useReveal(0.15);
  const secao = useReveal(0.2);
  const botoes = useRef<Array<HTMLButtonElement | null>>([]);

  const aba = abas[indice];

  // Teclado no padrão de abas: setas, Home e End. O foco acompanha a seleção.
  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    let proximo = indice;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') proximo = (indice + 1) % abas.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') proximo = (indice - 1 + abas.length) % abas.length;
    else if (e.key === 'Home') proximo = 0;
    else if (e.key === 'End') proximo = abas.length - 1;
    else return;
    e.preventDefault();
    setIndice(proximo);
    botoes.current[proximo]?.focus();
  };

  return (
    <section id="ia" className="av-inst-secao paper-grain" aria-labelledby="ia-titulo">
      <div className="av-inst-secao-in">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="ia-titulo" className="av-inst-secao-titulo">
            O que a IA faz por cada aula
          </h2>
          <p className="av-inst-secao-lead">
            O pipeline automatizado transforma a gravação bruta e as fotos do quadro em materiais pedagógicos
            estruturados.
          </p>
          <div className="av-inst-secao-fio" />
        </div>

        <div ref={secao.ref} className="av-inst-ia-grade">
          <div
            className="av-inst-abas"
            role="tablist"
            aria-label="Etapas do processamento por IA"
            aria-orientation="vertical"
            onKeyDown={aoTeclar}
          >
            {abas.map((a, i) => {
              const Icone = a.icone;
              const selecionada = i === indice;
              return (
                <button
                  key={a.id}
                  ref={(el) => {
                    botoes.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`ia-aba-${a.id}`}
                  aria-selected={selecionada}
                  aria-controls="ia-painel"
                  tabIndex={selecionada ? 0 : -1}
                  className="av-inst-aba"
                  onClick={() => setIndice(i)}
                >
                  <span className="av-inst-aba-icone">
                    <Icone aria-hidden="true" />
                  </span>
                  <span className="av-inst-aba-titulo">{a.titulo}</span>
                </button>
              );
            })}
          </div>

          <div className="av-inst-ia-painel" role="tabpanel" id="ia-painel" aria-labelledby={`ia-aba-${aba.id}`} tabIndex={0}>
            <div key={aba.id} className="av-inst-ia-conteudo">
              <p className="av-inst-ia-descricao">{aba.descricao}</p>
              <Demo tipo={aba.demo} ativo={secao.inView} />
            </div>
            <p className="av-inst-ia-aviso">
              Materiais gerados por IA são recursos de apoio e podem conter erros. Sempre confira com as anotações
              do seu caderno.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
