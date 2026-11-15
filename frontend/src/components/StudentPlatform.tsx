import { useState } from 'react';
import { Search, ImageIcon, BookOpen, ChevronRight, Presentation, Video, type LucideIcon } from 'lucide-react';
import EmblemaLeitura from './EmblemaLeitura';
import { useReveal } from '../hooks/useReveal.ts';
import { useRoteador } from '../app/Roteador.tsx';
import { tomDaDisciplina } from '../lib/tomDisciplina';
import './institucional.css';

interface AulaExemplo {
  disciplina: string;
  tema: string;
  professor: string;
  data: string;
  turma: string;
  temSlides: boolean;
  temFotos: boolean;
  temResumo: boolean;
  trecho: string;
}

const aulas: AulaExemplo[] = [
  {
    disciplina: 'Matemática',
    tema: 'Função do 1º grau',
    professor: 'Prof. Adriano Lobo',
    data: '08/11',
    turma: 'Turma B · 9º ano',
    temSlides: true,
    temFotos: true,
    temResumo: true,
    trecho: 'Compreensão intuitiva de coeficientes lineares e angulares, raiz da função e gráficos no cotidiano.',
  },
  {
    disciplina: 'História',
    tema: 'Renascimento italiano',
    professor: 'Profa. Helena',
    data: '07/11',
    turma: 'Turma A · 8º ano',
    temSlides: true,
    temFotos: true,
    temResumo: true,
    trecho: 'Da Vinci, Michelangelo e o florescer das artes, da razão e do humanismo em Florença.',
  },
  {
    disciplina: 'Ciências',
    tema: 'Fotossíntese e Energia',
    professor: 'Prof. Lobo',
    data: '06/11',
    turma: 'Turma C · 7º ano',
    temSlides: false,
    temFotos: true,
    temResumo: true,
    trecho: 'Como as plantas convertem luz em energia química através de tilacoides e ciclo de Calvin.',
  },
  {
    disciplina: 'Português',
    tema: 'Figuras de linguagem',
    professor: 'Profa. Marina',
    data: '05/11',
    turma: 'Turma B · 9º ano',
    temSlides: true,
    temFotos: false,
    temResumo: true,
    trecho: 'Metáfora, metonímia e personificação analisadas em textos poéticos e literários.',
  },
];

const filtros = ['Todas', 'Matemática', 'História', 'Ciências', 'Português'];

function Material({ icone: Icone, rotulo, ativo }: { icone: LucideIcon; rotulo: string; ativo: boolean }) {
  return (
    <li className="av-inst-material" data-ativo={ativo}>
      <Icone aria-hidden="true" />
      <span>{rotulo}</span>
      {!ativo && <span className="sr-only"> (não disponível nesta aula)</span>}
    </li>
  );
}

export default function StudentPlatform() {
  const [filtro, setFiltro] = useState('Todas');
  const [selecionada, setSelecionada] = useState(0);
  const { ref, inView } = useReveal(0.15);
  const rodape = useReveal(0.3);
  const { navegar } = useRoteador();

  const filtradas = filtro === 'Todas' ? aulas : aulas.filter((a) => a.disciplina === filtro);
  const atual = filtradas[Math.min(selecionada, filtradas.length - 1)] ?? aulas[0];

  return (
    <section id="plataforma" className="av-inst-secao paper-grain" aria-labelledby="plataforma-titulo">
      <div className="av-inst-secao-in">
        <div ref={ref} className={`av-inst-secao-topo reveal ${inView ? 'in-view' : ''}`}>
          <h2 id="plataforma-titulo" className="av-inst-secao-titulo">
            O aluno estuda no seu ritmo
          </h2>
          <p className="av-inst-secao-lead">
            Localize a aula por matéria ou data. Acesse resumos didáticos estruturados, apresentações de slides
            dinâmicas, fotos do quadro e guias visuais para gerar vídeo no Google NotebookLM.
          </p>
          <div className="av-inst-secao-fio" />
        </div>

        {/* Janela de demonstração: a barra é só ilustração; o botão "Abrir o app" é real */}
        <div className="av-inst-janela">
          <div className="av-inst-janela-barra">
            <span className="av-inst-janela-pontos" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="av-inst-janela-url" aria-hidden="true">
              <Search />
              aulaviva.com/#/aulas
            </span>
            <button type="button" className="av-inst-janela-abrir" onClick={() => navegar('/aulas')}>
              Abrir o app
            </button>
          </div>

          <div className="av-inst-janela-corpo">
            <div className="av-inst-lateral">
              <div className="av-filtros" role="group" aria-label="Filtrar exemplos por disciplina">
                {filtros.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="av-chip av-inst-chip"
                    aria-pressed={filtro === f}
                    onClick={() => {
                      setFiltro(f);
                      setSelecionada(0);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <ul className="av-inst-lateral-lista" aria-label="Aulas de exemplo">
                {filtradas.map((a, i) => (
                  <li key={a.tema} data-tom={tomDaDisciplina(a.disciplina)}>
                    <button
                      type="button"
                      className="av-inst-lateral-aula"
                      aria-current={atual.tema === a.tema ? 'true' : undefined}
                      onClick={() => setSelecionada(i)}
                    >
                      <span className="av-inst-lateral-meta">
                        <span className="av-inst-lateral-disciplina">{a.disciplina}</span>
                        <span>{a.data}</span>
                      </span>
                      <span className="av-inst-lateral-tema">{a.tema}</span>
                      <span className="av-inst-lateral-turma">{a.turma}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="av-inst-detalhe" key={atual.tema} data-tom={tomDaDisciplina(atual.disciplina)}>
              <p className="av-inst-detalhe-trilha">
                <span className="av-inst-detalhe-disciplina">{atual.disciplina}</span>
                <ChevronRight aria-hidden="true" />
                <span>{atual.turma}</span>
                <ChevronRight aria-hidden="true" />
                <span>{atual.data}</span>
              </p>
              <h3 className="av-inst-detalhe-titulo">{atual.tema}</h3>
              <p className="av-inst-detalhe-professor">{atual.professor}</p>

              <ul className="av-inst-materiais" aria-label="Materiais desta aula">
                <Material icone={BookOpen} rotulo="Resumo didático" ativo={atual.temResumo} />
                <Material icone={Presentation} rotulo="Slides dinâmicos" ativo={atual.temSlides} />
                <Material icone={ImageIcon} rotulo="Fotos do quadro" ativo={atual.temFotos} />
                <Material icone={Video} rotulo="Guia NotebookLM" ativo />
              </ul>

              <div className="av-inst-sintese">
                <p className="av-inst-sintese-rotulo">
                  <span className="av-inst-sintese-ponto anim-breathe" aria-hidden="true" />
                  Síntese estruturada
                </p>
                <p className="av-inst-sintese-texto">{atual.trecho}</p>
                <p className="av-inst-sintese-nota">
                  Gerado automaticamente a partir da exposição oral do professor e das anotações do quadro.
                </p>
                <div className="av-inst-sintese-acoes">
                  <button type="button" className="av-btn av-btn-primario" onClick={() => navegar('/aulas')}>
                    <Presentation aria-hidden="true" />
                    Ver resumo e slides
                  </button>
                  <button type="button" className="av-btn av-btn-contorno" onClick={() => navegar('/aulas')}>
                    <Video aria-hidden="true" />
                    Gerar vídeo no NotebookLM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={rodape.ref} className="av-inst-leitura">
          <EmblemaLeitura inView={rodape.inView} className="av-inst-leitura-emblema" />
          <p className="av-inst-leitura-texto">
            Para recuperar uma aula perdida, o estudante revisa o resumo, estuda pelos slides e aprofunda no
            próprio ritmo.
          </p>
        </div>
      </div>
    </section>
  );
}
