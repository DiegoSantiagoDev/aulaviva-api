import { RoteadorProvider, useRoteador } from './app/Roteador';
import LayoutApp from './app/LayoutApp';
import Nav from './components/Nav';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ProcessFlow from './components/ProcessFlow';
import AIFeatures from './components/AIFeatures';
import StudentPlatform from './components/StudentPlatform';
import TeacherArea from './components/TeacherArea';
import TechStack from './components/TechStack';
import Privacy from './components/Privacy';
import Roadmap from './components/Roadmap';
import CTA from './components/CTA';
import Footer from './components/Footer';

import PaginaEntrar from './pages/PaginaEntrar';
import Pagina404 from './pages/Pagina404';
import BibliotecaAulas from './features/aulas/BibliotecaAulas';
import DetalheAula from './features/aulas/DetalheAula';

function Marquee() {
  const items = [
    'Whisper Large V3',
    'Qwen 3.8 27B',
    'Spring Boot',
    'PostgreSQL',
    'Vite + React',
    'Tailwind CSS',
    'NotebookLM',
    'Offline-First',
  ];
  const row = [...items, ...items];
  return (
    <div className="border-y border-gold/20 bg-parchment py-6 overflow-hidden">
      <div className="flex gap-12 whitespace-nowrap anim-marquee">
        {row.map((name, i) => (
          <span key={i} className="font-display text-2xl sm:text-3xl text-ink-soft/50 flex items-center gap-12">
            {name}
            <span className="w-2 h-2 rounded-full bg-gold/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

function ApresentacaoInstitucional() {
  return (
    <div className="min-h-screen bg-parchment">
      <Nav />
      <Hero />
      <Marquee />
      <div id="funcionamento">
        <HowItWorks />
      </div>
      <ProcessFlow />
      <div id="ia">
        <AIFeatures />
      </div>
      <div id="plataforma">
        <StudentPlatform />
      </div>
      <TeacherArea />
      <div id="tecnologia">
        <TechStack />
      </div>
      <Privacy />
      <div id="etapas">
        <Roadmap />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}

function ConteudoRotas() {
  const { rota, parametros } = useRoteador();

  // Rota 1: Apresentação inicial
  if (rota === '/') {
    return <ApresentacaoInstitucional />;
  }

  // Rota 2: Porta de entrada (Sou aluno / Sou professor)
  if (rota === '/entrar') {
    return <PaginaEntrar />;
  }

  // Rotas da aplicação (Aluno e Professor) dentro do LayoutApp
  if (rota === '/aulas' || rota.startsWith('/aulas/') || rota === '/professor') {
    return (
      <LayoutApp>
        {rota === '/aulas' && <BibliotecaAulas />}

        {rota.startsWith('/aulas/') && parametros.id && (
          <DetalheAula id={parametros.id} />
        )}

        {rota === '/professor' && (
          <div className="anim-fade-up">
            <h1 className="font-display text-4xl font-bold text-ink">Painel do Professor</h1>
            <p className="mt-2 text-ink-soft">
              Cadastre novas aulas, envie arquivos de áudio com acompanhamento de progresso e fotos do quadro.
            </p>
            <div className="mt-8 art-frame rounded-2xl p-8 text-center border border-gold/30">
              <span className="text-xs uppercase tracking-widest2 text-gold font-semibold">
                Área Docente
              </span>
              <p className="mt-2 text-ink text-lg font-display">
                O painel de envio e acompanhamento será implementado na Fase 8.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <a href="#/entrar" className="ink-btn px-5 py-2.5 rounded-full text-xs font-semibold">
                  Voltar à Escolha de Perfil
                </a>
              </div>
            </div>
          </div>
        )}
      </LayoutApp>
    );
  }

  // Rota inexistente (404)
  return <Pagina404 />;
}

export default function App() {
  return (
    <RoteadorProvider>
      <ConteudoRotas />
    </RoteadorProvider>
  );
}
